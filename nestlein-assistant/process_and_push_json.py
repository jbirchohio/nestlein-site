import os
import json
import base64
import requests
import gspread
from openai import OpenAI
from dotenv import load_dotenv
import time
from github import Github

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ASSISTANT_ID = os.getenv("OPENAI_ASSISTANT_ID")
SHEET_ID = os.getenv("SHEET_ID")
SHEET_NAME = os.getenv("SHEET_NAME")
CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_JSON")
APIFY_TOKEN = os.getenv("APIFY_TOKEN")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = "jbirchohio/nestlein-site"
GITHUB_PATH_PREFIX = "data/locations"

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
                return data[0]
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

    # Prompt with extraction instructions
    full_prompt = """
You are analyzing raw Google Business scraped data to generate a structured summary for a remote work-friendly location directory. Use ONLY the raw data provided below to extract the values for each field. Do NOT echo back the instructions; output only the extracted values in the requested format.

##Guidelines##
0. Your output must be based solely on the raw data provided below.
1. Express all information in American English.
2. Do NOT include any of the scoring algorithm guidelines text in your final output.
3. For each field, extract the data from the raw content.
4. If a piece of data is not available, output "Unknown" (for Logo URL, output an empty string if not available).

### Scoring Algorithm ###
Analyze the data and assign scores (from 1 to 10) for the following categories:
 1. Food/Quality (taste, freshness, presentation)
 2. Service (friendliness, speed, attentiveness)
 3. Ambiance/Atmosphere (cleanliness, décor, vibe, noise level)
 4. Value (worth the cost, portion size, overall pricing)
 5. Experience (overall enjoyment, standout moments or issues)

Calculate the **Final Score** as the average of these five categories, rounded to one decimal place.
Output the final score as:
**Final Score**: [score]/10

---

##Basic Information##
**Restaurant Name**: Extract the restaurant's name.
**Website URL**: Extract the base URL of the restaurant’s website from the raw data and append ?ref=nestlein.
**Logo URL**: Extract the full image URL for the restaurant logo; if not available, output an empty string ("").
**Address**: Extract the full business address (street number, street name, city, state, ZIP).
**Phone Number**: Extract the phone number in standard U.S. format.
**Hours of Operation**: Extract the business hours (in 12-hour format). If inconsistent, output "Check Website for Updated Hours".
**Restaurant Score**: Extract and output the final score out of 10, to two decimal places.
**Best Time to Work Remotely**: Extract the best time to work there.

---

##Remote Work Features##
**Wi-Fi Quality**: Extract a description of the Wi-Fi quality (e.g., Fast, Spotty, Slow, Secure).
**Outlet Access**: Extract the availability of outlets (e.g., Lots, Few, None, Some under seats).
**Noise Level**: Extract a description of the noise level (e.g., Quiet, Moderate, Loud).
**Seating Comfort**: Extract the comfort level of seating (e.g., Cozy couches, Padded booths, Uncomfortable chairs, Spacious tables).
**Natural Light**: Extract if there is ample natural light (Yes/No/Some).
**Stay Duration Friendliness**: Extract if customers can stay for long periods (e.g., "Yes, Encouraged" or "No, 1-hour max").
**Food & Drink Options**: Extract a summary of the available food and drinks.
**Bathroom Access**: Extract whether bathrooms are available and accessible.
**Parking Availability**: Extract information about available parking.
**Tags**: Based on the data, suggest 3–5 relevant tags as a comma-separated list (for example, Quiet Space, Pet-Friendly, LGBTQ+ Friendly, Fast Wi-Fi, Study Spot).

DO NOT include any extraneous text or disclaimers in your output. Output only the key-value pairs exactly in this format (each field on one line):

**[key]**: [value]
"""

    # First user message — instructions
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=full_prompt
    )

    # Second user message — raw JSON
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=json.dumps(apify_output, indent=2)
    )

    # Run Assistant
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=ASSISTANT_ID
    )

    while run.status not in ["completed", "failed"]:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread.id)
    return messages.data[0].content[0].text.value.strip()

# --- GitHub Push Logic ---
def push_to_github(slug, content):
    repo = Github(GITHUB_TOKEN).get_repo(GITHUB_REPO)
    filepath = f"{GITHUB_PATH_PREFIX}/{slug}.json"
    b64_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
    try:
        existing = repo.get_contents(filepath)
        repo.update_file(filepath, f"Update {slug}", content, existing.sha)
    except:
        repo.create_file(filepath, f"Add {slug}", content)

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
