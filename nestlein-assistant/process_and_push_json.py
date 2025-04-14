import os
import json
import base64
import requests
import gspread
from openai import OpenAI
from dotenv import load_dotenv
import time

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ASSISTANT_ID = os.getenv("OPENAI_ASSISTANT_ID")
SHEET_ID = os.getenv("SHEET_ID")
SHEET_NAME = os.getenv("SHEET_NAME")
CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_JSON")
APIFY_TOKEN = os.getenv("APIFY_TOKEN")

# --- Google Sheets Setup ---
gc = gspread.service_account(filename=CREDENTIALS_FILE)
sheet = gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)

# --- Polling Logic for Apify ---
def poll_apify(run_id):
    dataset_url = f"https://api.apify.com/v2/datasets/{run_id}/items?format=json&clean=true"
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    
    for _ in range(60):
        dataset_res = requests.get(dataset_url, headers=headers)
        if dataset_res.status_code == 200:
            try:
                data = dataset_res.json()
            except Exception as e:
                print("Error parsing JSON:", e)
                data = None
            if data:
                return data[0]  # Change this to return the full array if needed
        time.sleep(5)
    raise TimeoutError("Apify data fetch timed out or returned empty.")

# --- Trigger Apify Actor ---
def trigger_apify_actor(actor_slug, place_id):
    actor_url = f"https://api.apify.com/v2/acts/{actor_slug}/runs"
    payload = {"placeIds": [place_id]}
    response = requests.post(actor_url, params={"token": APIFY_TOKEN}, json=payload)
    if response.status_code in [200, 201]:
        return response.json().get("data", {}).get("defaultDatasetId")
    else:
        print(f"❌ Apify failed for {place_id} on actor {actor_slug}: {response.text}")
        return None

# --- Assistant Conversation ---
def run_assistant_conversation(apify_output):
    thread = client.beta.threads.create()
    content = json.dumps(apify_output, indent=2)
    
    # Instruct the GPT assistant to output the following keys on a single line.
    # For 'tags', output a comma-separated list (e.g., tag1, tag2, tag3).
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=f"""
You are analyzing raw Google Business scraped data to generate a structured summary for a remote work-friendly location directory.

##Guidelines##
0. Your output must follow my rules.
1. Print your Information in American English.
2. Do NOT show the Scoring Algorithm Guidelines in your response — only show the final score.
3. I will give you a title of a field I want you to output data for. The field will be wrapped in asterisks — for example: **Restaurant Title**: followed by the rules I have given you.
4. If a piece of data is not clearly available, use your best judgment or return "Unknown".

### Scoring Algorithm:
Please analyze the data for this place and assign scores for these categories:
 1. Food/Quality (taste, freshness, presentation)  
 2. Service (friendliness, speed, attentiveness)  
 3. Ambiance/Atmosphere (cleanliness, décor, vibe, noise level)  
 4. Value (worth the cost, portion size, overall pricing)  
 5. Experience (overall enjoyment, any standout moments or issues)

Each category should be scored individually from 1 to 10. Then, calculate the **Final Score** as the average of these five categories, rounded to one decimal place.

**Final Score**: X.X/10  
**Do Not Give any Disclaimers** about the scores or how they were calculated.

---

##Basic Information##

**Restaurant Name**: Print the name of the restaurant.

**Website URL**: Print the base URL of the business and append ?ref=nestlein to the end.

Logo URL: Print the full image URL for the restaurant logo if it exists in the raw data. If not available, return an empty string ("").

**Address**: Print the full business address, including street number, street name, city, state, and ZIP code.

**Phone Number**: Print the phone number in standard U.S. format.

**Hours of Operation**: Print the business hours in 12-hour format. If they show split or inconsistent hours, return: "Check Website for Updated Hours".

**Restaurant Score**: Print only the final score out of 10, to two decimal places.

**Best Time to Work Remotely**: State the best time to work there (e.g., "Weekday mornings before 11am" or "Tuesdays from 12–8pm").

---

##Remote Work Features##

**Wi-Fi Quality**: Rate or describe Wi-Fi speed and reliability (e.g., Fast, Spotty, Slow, Secure).

**Outlet Access**: How many outlets are available? (e.g., Lots, Few, None, Some under seats).

**Noise Level**: Describe typical noise level (e.g., Quiet, Moderate, Loud).

**Seating Comfort**: Describe the comfort level of seating for working (e.g., Cozy couches, Padded booths, Uncomfortable chairs, Spacious tables).

**Natural Light**: Is there a good amount of natural light? (Yes/No/Some).

**Stay Duration Friendliness**: Can customers stay for long periods? (Yes, Encouraged / No, 1-hour max / Not specified).

**Food & Drink Options**: Summarize available food/drinks (e.g., Coffee, teas, vegan pastries, smoothies).

**Bathroom Access**: State if bathrooms are available and easy to access (Yes / No / Customers Only / Unknown).

**Parking Availability**: Describe available parking (e.g., Street parking, Lot available, Limited spots, No parking).

**Tags**: Based on all the data, suggest 3–5 relevant tags such as: Quiet Space, Pet-Friendly, LGBTQ+ Friendly, Fast Wi-Fi, Study Spot, Vegan Options, Black-Owned, Good for Groups.

Use ONLY the provided data. Do not hallucinate. Use inference only when it is logical and supported by context.

This is the data:

{content}
"""
    )
    
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=ASSISTANT_ID
    )
    
    while run.status not in ["completed", "failed"]:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
    
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    return messages.data[0].content[0].text.value

# --- Push to GitHub ---
def push_to_github(slug, markdown_output):
    repo = os.getenv("GITHUB_REPO")
    token = os.getenv("GITHUB_TOKEN")
    filename = f"{slug}.json"
    path = f"data/locations/{filename}"
    
    print("Assistant Output:\n", markdown_output)
    
    lines = markdown_output.splitlines()
    json_data = {}
    current_key = None
    
    for line in lines:
        if line.startswith("- "):
            if "tags_reasoning" not in json_data:
                json_data["tags_reasoning"] = []
            json_data["tags_reasoning"].append(line[2:])
        elif line.startswith("**") and "**: " in line:
            parts = line.split("**: ", 1)
            if len(parts) == 2:
                key = parts[0].strip("* ").lower().replace(" ", "_")
                value = parts[1].strip()
                if key == "tags":
                    # Split the comma-separated tags into an array.
                    json_data[key] = [tag.strip() for tag in value.split(",") if tag.strip()]
                else:
                    json_data[key] = value
                current_key = key
        elif current_key:
            json_data[current_key] += " " + line.strip()
    
    json_str = json.dumps(json_data, indent=2)
    encoded = base64.b64encode(json_str.encode()).decode()
    
    url = f"https://api.github.com/repos/{repo}/contents/{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }
    
    get_resp = requests.get(url, headers=headers)
    sha = get_resp.json().get("sha") if get_resp.status_code == 200 else None
    
    payload = {
        "message": f"Add or update {filename}",
        "content": encoded,
        "committer": {
            "name": "Assistant Bot",
            "email": "assistant@nestlein.ai"
        }
    }
    if sha:
        payload["sha"] = sha
    
    put_resp = requests.put(url, headers=headers, data=json.dumps(payload))
    
    if put_resp.status_code in [200, 201]:
        print("✅ Successfully pushed to GitHub!")
        return True
    else:
        print(f"❌ GitHub push failed: {put_resp.status_code} – {put_resp.text}")
        return False

# --- Orchestrator ---
def get_all_place_ids():
    return sheet.col_values(1)[1:]

def get_already_processed():
    if os.path.exists("processed_ids.json"):
        with open("processed_ids.json", "r") as f:
            return json.load(f)
    return []

def save_processed(ids):
    with open("processed_ids.json", "w") as f:
        json.dump(ids, f)

def process_all():
    print("🚀 Starting full assistant pipeline")
    place_ids = get_all_place_ids()
    already_done = get_already_processed()
    new_ids = [pid for pid in place_ids if pid not in already_done]
    
    if not new_ids:
        print("✅ No new Place IDs found.")
        return
    
    for place_id in new_ids:
        print(f"🔍 Handling: {place_id}")
        biz_run_id = trigger_apify_actor("compass~google-places-api", place_id)
        if not biz_run_id:
            continue
        
        business_data = poll_apify(biz_run_id)
        if not business_data:
            print("❌ Business data not available.")
            continue
        
        combined = {
            "business_data": business_data,
            "review_summary": ""
        }
        
        summary = run_assistant_conversation(combined)
        slug = place_id.replace(":", "-")
        push_to_github(slug, summary)
        
        already_done.append(place_id)
        save_processed(already_done)
    
    print("🎉 All locations processed.")

if __name__ == "__main__":
    process_all()
