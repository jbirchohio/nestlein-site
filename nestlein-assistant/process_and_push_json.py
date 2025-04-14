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
                return data[0]  # Modify this to return the full array if needed
        time.sleep(5)
    raise TimeoutError("Apify data fetch timed out or returned empty.")

# --- Trigger Apify Actor ---
def trigger_apify_actor(actor_slug, place_id):
    import json
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

    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=f"""
You are analyzing raw Google Business scraped data to generate a structured summary for a remote work-friendly location directory.
Use ONLY the provided data. Do not hallucinate. Use inference *only* when it is logical and supported by context.
Please output the following keys in a markdown block, exactly in this format:
**name**: [location name]
**address**: [location address]
**hours**: [opening hours]
**phone_number**: [phone number]
**logo_url**: [logo image URL]
**tags**: [comma-separated tags]
Include any additional keys as needed.
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
    
    # Debug: print the assistant's markdown output
    print("Assistant Output:\n", markdown_output)
    
    # Preserve the '**' markers; do not remove them.
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
                # Special handling for tags: split comma-separated string into an array.
                if key == "tags":
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
    return sheet.col_values(1)[1:]  # Skip header

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
