import os
import json
import time
import re
from dotenv import load_dotenv
from openai import OpenAI
from github import Github, InputGitTreeElement
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ASSISTANT_ID = os.getenv("OPENAI_ASSISTANT_ID")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = "jbirchohio/nestlein-site"
GITHUB_PATH_PREFIX = "public/locations"


def convert_to_remote_tags(categories):
    tag_map = {
        "cafe": ["free wi-fi", "coffee served", "long stay friendly"],
        "coffee shop": ["coffee served", "outlets available", "natural light"],
        "bakery": ["grab & go food", "casual meetings"],
        "coworking space": ["great for solo work", "networking spot"],
        "library": ["quiet environment", "study friendly"],
        "restaurant": ["food & drink available"],
        "event venue": ["open seating", "group-friendly"],
    }

    result = set()
    for cat in categories:
        key = cat.lower()
        for term, tags in tag_map.items():
            if term in key:
                result.update(tags)
    return list(result)


def slugify_location(name, address=""):
    base = name.lower().strip() if name else "unknown"
    zip_code = ""
    if address:
        match = re.search(r"\\b\\d{5}\\b", address)
        if match:
            zip_code = match.group(0)
    slug = f"{base}-{zip_code}" if zip_code else base
    return re.sub(r'[^a-z0-9]+', '-', slug).strip('-')


def yes_list(category):
    return [
        list(item.keys())[0]
        for item in category
        if item and isinstance(item, dict) and list(item.values())[0] is True
    ]


def format_hours(opening_hours):
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hours_map = {h['day']: h['hours'] for h in opening_hours if 'day' in h and 'hours' in h}
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
    out.append(f"Title: {bd.get('name', '')}")
    out.append(f"Description: {bd.get('about', '')}")
    out.append(f"Address: {bd.get('address', '')}")
    out.append(f"Phone: {bd.get('phone', '')}")
    out.append(f"Website: {bd.get('site', '')}")
    out.append(f"CID: {bd.get('cid', '')}")
    out.append("Opening Hours:")
    for h in bd.get("opening_hours", []):
        out.append(f"  - {h.get('day')}: {h.get('hours')}")
    out.append(f"Tags: {', '.join(bd.get('types', []))}")
    return "\n".join(out)


def add_ref_param(url, ref="roamly"):
    try:
        parts = urlparse(url)
        query = parse_qs(parts.query)
        query["ref"] = [ref]
        new_query = urlencode(query, doseq=True)
        return urlunparse(parts._replace(query=new_query))
    except:
        return url


def build_structured_json(bd):
    ai = bd.get("additional_info", {}) or bd.get("about", {})
    return {
        "slug": slugify_location(bd.get("name"), bd.get("address")),
        "name": bd.get("name"),
        "place_id": bd.get("place_id"),
        "cid": bd.get("cid", "Unknown"),
        "address": bd.get("address", "Unknown"),
        "phone": bd.get("phone", "Unknown"),
        "website": add_ref_param(bd.get("site", "")),
        "logo_url": bd.get("photos_sample", ["https://roamly.app/default-image.jpg"])[0] if bd.get("photos_sample") else "https://roamly.app/default-image.jpg",
        "latitude": bd.get("location", {}).get("lat") or "Unknown",
        "longitude": bd.get("location", {}).get("lng") or "Unknown",
        "hours": format_hours(bd.get("opening_hours", [])),
        "open_now": bd.get("opening_hours_status", "Unknown"),
        "tags": convert_to_remote_tags(bd.get("types", [])),
        "remote_work_features": {
            "wi_fi_quality": "Free Wi-Fi" if "wifi" in str(bd).lower() else "Unknown",
            "bathroom_access": "Yes" if "restroom" in str(bd).lower() else "Unknown",
            "outlet_access": "Available" if "outlet" in str(bd).lower() else "Unknown",
            "seating_comfort": "Comfortable" if "seating" in str(bd).lower() else "Unknown",
            "noise_level": "Quiet" if "quiet" in str(bd).lower() else "Unknown",
            "natural_light": "Yes" if "natural light" in str(bd).lower() else "Unknown"
        }
    }


def run_assistant_conversation(business_data):
    thread = client.beta.threads.create()
    prompt = """You are analyzing structured business data for a remote work–friendly café directory called Roamly. 

Use ONLY the information provided below to extract the following:

---

**Required Fields:**

1. `best_time_to_work_remotely`:  
   - Output a short phrase like “Before 10 AM,” “Mid-afternoon,” or “Unknown”
   - Base this on fields such as: open hours, popular times, crowd, and tags like “Usually a wait,” “Good for working on laptop,” etc.

2. `remote_work_summary`:  
   - Output 1–2 sentences describing the space’s suitability for remote work
   - Consider Wi-Fi, outlet access, crowd type, noise level, bathroom access, seating, and overall vibe
   - Tailor it to remote workers (e.g., freelancers, students, quiet seekers)

---

**Optional Scoring Section (optional, include if enough data is present):**

3. `scores`:  
   Assign a score from 1 to 10 (10 = best) for the following:
   - `food_quality`: Based on tags like \"Prepared foods,\" \"Vegetarian,\" \"Menu\"
   - `service`: Based on tags like \"Usually a wait,\" “Friendly staff,” “Drive-through”
   - `ambiance`: Based on atmosphere, crowd, décor tags like “Trendy,” “Casual,” etc.
   - `value`: Consider price range + offerings
   - `experience`: A general overall impression of remote work suitability

---

**Output Format:**
Respond ONLY in this structured JSON format:

```json
{
  "best_time_to_work_remotely": "Before 10 AM",
  "remote_work_summary": "A quiet café with free Wi-Fi and casual seating. Outlet access is moderate, and it's best suited for solo work in the mornings.",
  "scores": {
    "food_quality": 7,
    "service": 8,
    "ambiance": 7,
    "value": 6,
    "experience": 8
  }
}
```

If a score or detail is unclear or missing, do your best to infer it. If not possible, omit the scores block entirely.

Do not echo these instructions. Do not explain your reasoning. Output valid JSON only."""

    flattened = flatten_business_data(business_data)
    full_input = f"{prompt}\n\n{flattened}"

    client.beta.threads.messages.create(thread_id=thread.id, role="user", content=full_input)
    run = client.beta.threads.runs.create(thread_id=thread.id, assistant_id=ASSISTANT_ID)

    while run.status not in ["completed", "failed"]:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread.id)
    raw_output = messages.data[0].content[0].text.value.strip()

    if raw_output.startswith("```json"):
        raw_output = raw_output[7:]
    elif raw_output.startswith("```"):
        raw_output = raw_output[3:]

    if raw_output.endswith("```"):
        raw_output = raw_output[:-3]

    try:
        return json.loads(raw_output.strip())
    except json.JSONDecodeError:
        print("⚠️ Could not parse Assistant output. Dumping raw text:")
        print(raw_output)
        return {"output": raw_output}


def batch_push_to_github(file_data_list, commit_message="Batch update locations"):
    repo = Github(GITHUB_TOKEN).get_repo(GITHUB_REPO)
    master_ref = repo.get_git_ref("heads/main")
    base_tree = repo.get_git_tree(master_ref.object.sha)
    elements = []
    for f in file_data_list:
        blob = repo.create_git_blob(f["content"], "utf-8")
        element = InputGitTreeElement(
            path=f["path"],
            mode="100644",
            type="blob",
            sha=blob.sha
        )
        elements.append(element)
    tree = repo.create_git_tree(elements, base_tree)
    parent = repo.get_git_commit(master_ref.object.sha)
    commit = repo.create_git_commit(commit_message, tree, [parent])
    master_ref.edit(commit.sha)


def get_already_processed():
    if os.path.exists("processed_slugs.json"):
        with open("processed_slugs.json", "r") as f:
            return set(json.load(f))
    return set()

def save_processed(slugs):
    with open("processed_slugs.json", "w") as f:
        json.dump(sorted(list(slugs)), f)

def process_outscraper_json(path="Outscraper.json", limit=5):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    already_seen = get_already_processed()
    newly_processed = set()
    batched_files = []
    for i, bd in enumerate(data[:limit]):
        slug = slugify_location(bd.get("name"), bd.get("address"))
        if slug in already_seen:
            print(f"⏭️ Skipping already-processed: {slug}")
            continue

        print(f"🔍 Processing: {bd.get('name')}")
        structured = build_structured_json(bd)
        ai_fields = run_assistant_conversation(bd)
        merged = {**structured, **ai_fields}
        file_path = f"{GITHUB_PATH_PREFIX}/{merged['slug']}.json"
        file_content = json.dumps(merged, indent=2)
        batched_files.append({"path": file_path, "content": file_content})
        newly_processed.add(slug)

    if batched_files:
        batch_push_to_github(batched_files)
        save_processed(already_seen.union(newly_processed))
        print(f"✅ Uploaded {len(batched_files)} files.")


if __name__ == "__main__":
    process_outscraper_json("Outscraper.json", limit=5)
