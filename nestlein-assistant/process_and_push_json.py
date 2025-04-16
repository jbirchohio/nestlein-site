import os
import json
import base64
import requests
import gspread
import time
import yaml
import re
from openai import OpenAI
from dotenv import load_dotenv
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
GITHUB_PATH_PREFIX = "public/locations"

gc = gspread.service_account(filename=CREDENTIALS_FILE)
sheet = gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)

def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().strip()).strip('-')

def flatten_business_data(bd):
    def yes_list(category):
        return [
            list(item.keys())[0]
            for item in category
            if item is not None and isinstance(item, dict) and list(item.values())[0] is True
        ]

    out = []
    out.append(f"Title: {bd.get('title', '')}")
    out.append(f"Description: {bd.get('description', '')}")
    out.append(f"Price: {bd.get('price', '')}")
    out.append(f"Category: {bd.get('categoryName', '')}")
    out.append(f"Address: {bd.get('address', '')}")
    out.append(f"Phone: {bd.get('phone', '')}")
    out.append(f"Website: {bd.get('website', '')}")
    out.append(f"Image URL: {bd.get('imageUrl', '')}")
    out.append("Opening Hours:")
    for h in bd.get("openingHours", []):
        out.append(f"  - {h.get('day')}: {h.get('hours')}")
    out.append(f"Tags: {', '.join(bd.get('categories', []))}")

    # Additional Info (checkbox-style fields)
    ai = bd.get("additionalInfo", {})
    out.append(f"Amenities: {', '.join(yes_list(ai.get('Amenities', [])))}")
    out.append(f"Atmosphere: {', '.join(yes_list(ai.get('Atmosphere', [])))}")
    out.append(f"Popular For: {', '.join(yes_list(ai.get('Popular for', [])))}")
    out.append(f"Offerings: {', '.join(yes_list(ai.get('Offerings', [])))}")
    out.append(f"Service Options: {', '.join(yes_list(ai.get('Service options', [])))}")
    out.append(f"Dining Options: {', '.join(yes_list(ai.get('Dining options', [])))}")
    out.append(f"Parking: {', '.join(yes_list(ai.get('Parking', [])))}")
    out.append(f"Accessibility: {', '.join(yes_list(ai.get('Accessibility', [])))}")
    out.append(f"Crowd: {', '.join(yes_list(ai.get('Crowd', [])))}")
    out.append(f"Planning: {', '.join(yes_list(ai.get('Planning', [])))}")
    out.append(f"Payments: {', '.join(yes_list(ai.get('Payments', [])))}")

    # Popularity Histogram
    hist = bd.get("popularTimesHistogram", [])
    if isinstance(hist, list):
       out.append("POPULAR TIMES DATA:")
       for day in hist:
           if isinstance(day, dict) and "day" in day:
              out.append(f"  {day['day']}:")
              for hour in day.get("hours", []):
                  if isinstance(hour, dict) and "hour" in hour and "occupancyPercent" in hour:
                     out.append(f"    - {hour['hour']}: {hour['occupancyPercent']}%")


    # Current Crowd Level
    current = bd.get("currentPopularHour", {})
    if current:
        out.append(f"Current Popular Hour: {current.get('hour')} — {current.get('occupancyPercent')}% busy")

    # Review Summary
    if bd.get("reviewSummary"):
        out.append(f"Review Summary: {bd['reviewSummary']}")

    # Extra fields from the raw data if present
    if bd.get("plusCode"):
        out.append(f"Plus Code: {bd['plusCode']}")
    if bd.get("googleMapsUrl"):
        out.append(f"Google Maps URL: {bd['googleMapsUrl']}")

    return "\n".join(out)

def poll_apify(run_id):
    url = f"https://api.apify.com/v2/datasets/{run_id}/items?format=json&clean=true"
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    for _ in range(60):
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            try:
                data = res.json()
                if data:
                    return data[0]
            except:
                pass
        time.sleep(5)
    raise TimeoutError("Apify polling timed out.")

def trigger_apify_actor(actor_slug, place_id):
    url = f"https://api.apify.com/v2/acts/{actor_slug}/runs"
    res = requests.post(url, params={"token": APIFY_TOKEN}, json={"placeIds": [place_id]})
    if res.status_code in [200, 201]:
        return res.json().get("data", {}).get("defaultDatasetId")
    print(f"❌ Apify failed for {place_id}: {res.text}")
    return None

def run_assistant_conversation(business_data):
    thread = client.beta.threads.create()

    prompt = """You are analyzing raw Google Business data and recent Google Maps reviews to generate a structured summary for a remote work–friendly location directory. Use ONLY the data provided below.

##Guidelines##
0. Use only the raw scraped data and reviews to infer answers.
1. Write in American English.
2. Output only structured JSON — no commentary, markdown, or extra text.
3. For missing data, write "Unknown". For Logo URL, use "" if not available.

--- BASIC INFO ---
**Restaurant Name**: Full name.
**Website URL**: Base URL with ?ref=nestlein appended.
**Logo URL**: Full URL or "".
**Address**: Full street address.
**Phone Number**: US format.
**Hours of Operation**: If day-by-day is inconsistent, use "Check Website for Updated Hours".
**Restaurant Score**: Average from the 5 categories below.
**Best Time to Work Remotely**: Use popularity and review info to suggest a quiet time block (e.g., “Weekday mornings before 11 AM”).

--- CATEGORY RATINGS (Score 1-10) ---
**Food/Quality**
**Service**
**Ambiance/Atmosphere**
**Value**
**Experience**
Add final score as: **Final Score**: X.X/10

--- REMOTE WORK FEATURES ---
**Wi-Fi Quality**
**Outlet Access**
**Noise Level**
**Seating Comfort**
**Natural Light**
**Stay Duration Friendliness**
**Food & Drink Options**
**Bathroom Access**
**Parking Availability**
**Tags**: 3–5 comma-separated keywords like "Study Spot, Pet-Friendly, Chill Vibe".

--- Raw Data (business info and reviews) ---
"""

    flattened = flatten_business_data(business_data)
    full_input = f"{prompt}\n\n{flattened}"

    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=full_input
    )

    run = client.beta.threads.runs.create(thread_id=thread.id, assistant_id=ASSISTANT_ID)

    while run.status not in ["completed", "failed"]:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread.id)
    raw_output = messages.data[0].content[0].text.value.strip()

    try:
        cleaned = raw_output.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        response = json.loads(cleaned.strip())
        response["slug"] = slugify(response.get("name", "location"))
        return response
    except Exception as e:
        print("🟡 Output not structured as expected. Raw text:")
        print(raw_output)
        return {"output": raw_output}

def push_to_github(slug, content):
    repo = Github(GITHUB_TOKEN).get_repo(GITHUB_REPO)
    filepath = f"{GITHUB_PATH_PREFIX}/{slug}.json"
    encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
    try:
        existing = repo.get_contents(filepath)
        repo.update_file(filepath, f"Update {slug}", content, existing.sha)
    except:
        repo.create_file(filepath, f"Add {slug}", content)

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
    print(f"🔍 Processing: {place_id}")
    run_id = trigger_apify_actor("compass~google-places-api", place_id)
    if not run_id:
        continue
    raw_data = poll_apify(run_id)
    if not raw_data:
        continue

    review_run_id = trigger_apify_actor("compass~google-maps-reviews-scraper", place_id)
    if review_run_id:
        review_data = poll_apify(review_run_id)
        if review_data:
            raw_data["reviews"] = review_data.get("reviews", [])

    response = run_assistant_conversation(raw_data)
    slug = response.get("slug", place_id.replace(":", "-"))
    push_to_github(slug, json.dumps(response, indent=2))
    already_done.append(place_id)
    save_processed(already_done)


    print("🎉 All locations processed.")

if __name__ == "__main__":
    process_all()
