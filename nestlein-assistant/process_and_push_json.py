# process_and_push_json.py

import os
import json
import base64
import requests
import gspread
import time
import re
from openai import OpenAI
from dotenv import load_dotenv
from github import Github

# Load .env credentials
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

# Google Sheets
gc = gspread.service_account(filename=CREDENTIALS_FILE)
sheet = gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)


def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().strip()).strip('-')


def yes_list(category):
    return [
        list(item.keys())[0]
        for item in category
        if item and isinstance(item, dict) and list(item.values())[0] is True
    ]
def format_hours(opening_hours):
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hours_map = {h['day']: h['hours'] for h in opening_hours if 'day' in h and 'hours' in h}

    # Sort and normalize
    sorted_days = [d for d in days_order if d in hours_map]
    grouped = []
    last_hours = None
    group = []

    for day in sorted_days:
        current_hours = hours_map[day]
        if current_hours == last_hours:
            group.append(day)
        else:
            if group:
                grouped.append((group, last_hours))
            group = [day]
            last_hours = current_hours

    if group:
        grouped.append((group, last_hours))

    def label_range(days):
        if len(days) == 1:
            return days[0]
        return f"{days[0][:3]}–{days[-1][:3]}"

    return ", ".join([f"{label_range(group)}: {hours}" for group, hours in grouped])


def flatten_business_data(bd):
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
    ai = bd.get("additionalInfo", {})
    for section in ["Amenities", "Atmosphere", "Popular for", "Offerings", "Service options",
                    "Dining options", "Parking", "Accessibility", "Crowd", "Planning", "Payments"]:
        out.append(f"{section}: {', '.join(yes_list(ai.get(section, [])))}")
    if bd.get("reviewSummary"):
        out.append(f"Review Summary: {bd['reviewSummary']}")
    if bd.get("plusCode"):
        out.append(f"Plus Code: {bd['plusCode']}")
    if bd.get("googleMapsUrl"):
        out.append(f"Google Maps URL: {bd['googleMapsUrl']}")
    if "reviews" in bd:
        out.append("Recent Reviews:")
        for r in bd["reviews"][:5]:
            out.append(f"- {r.get('title', '')}: {r.get('text', '')}")
    return "\n".join(out)


def build_structured_json(bd):
    ai = bd.get("additionalInfo", {})
    return {
        "name": bd.get("title"),
        "address": bd.get("address"),
        "slug": slugify(bd.get("title", "")),
        "phone_number": bd.get("phone"),
        "logo_url": bd.get("imageUrl", ""),
        "website": bd.get("website"),
        "menu_url": bd.get("menu"),
        "latitude": bd.get("location", {}).get("lat"),
        "longitude": bd.get("location", {}).get("lng"),
        "hours": format_hours(bd.get("openingHours", [])),
        "price": bd.get("price"),
        "tags": bd.get("categories", []),
        "neighborhood": bd.get("neighborhood"),
        "review_score": bd.get("totalScore"),
        "review_count": bd.get("reviewsCount"),
        "remote_work_features": {
            "wi_fi_quality": "Free Wi-Fi" if "Free Wi-Fi" in yes_list(ai.get("Amenities", [])) else "Unknown",
            "bathroom_access": "Yes" if "Restroom" in yes_list(ai.get("Amenities", [])) else "Unknown",
            "outlet_access": "Moderate" if "Good for working on laptop" in yes_list(ai.get("Popular for", [])) else "Limited",
            "seating_comfort": "Basic",
            "noise_level": "Casual" if "Casual" in yes_list(ai.get("Atmosphere", [])) else "Unknown",
            "natural_light": "Some natural light",
            "stay_duration_friendliness": "Welcoming for long stays",
            "food_drink_options": ", ".join(yes_list(ai.get("Offerings", []))),
            "parking_availability": "Free parking lot" if "Free parking lot" in yes_list(ai.get("Parking", [])) else "Unknown"
        }
    }


def trigger_apify_actor(actor_slug, place_id):
    url = f"https://api.apify.com/v2/acts/{actor_slug}/runs"
    res = requests.post(url, params={"token": APIFY_TOKEN}, json={"placeIds": [place_id]})
    if res.status_code in [200, 201]:
        return res.json().get("data", {}).get("defaultDatasetId")
    print(f"❌ Apify failed for {place_id}: {res.text}")
    return None


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


def run_assistant_conversation(business_data):
    thread = client.beta.threads.create()

    prompt = """You are analyzing structured business data and recent Google Maps reviews to generate a summary for a remote work–friendly location directory. Use ONLY the data provided below.

Return valid JSON with these fields:

- best_time_to_work_remotely
- remote_work_summary
- Optional block: scores { food_quality, service, ambiance, value, experience }

Do not return any commentary or markdown. JSON only."""

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
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
        return json.loads(raw_output.strip())
    except:
        print("⚠️ Could not parse Assistant output. Dumping raw text:")
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

        structured = build_structured_json(raw_data)
        ai_fields = run_assistant_conversation(raw_data)
        merged = {**structured, **ai_fields}
        slug = merged.get("slug", place_id.replace(":", "-"))
        push_to_github(slug, json.dumps(merged, indent=2))
        already_done.append(place_id)
        save_processed(already_done)

    print("🎉 All locations processed.")


if __name__ == "__main__":
    process_all()
