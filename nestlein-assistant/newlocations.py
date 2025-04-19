import os
import json
import time
import re
import requests
from dotenv import load_dotenv
from openai import OpenAI
from github import Github, InputGitTreeElement
import gspread
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

load_dotenv()

# 1. Credentials & Config
APIFY_TOKEN          = os.getenv("APIFY_TOKEN")
OPENAI_KEY           = os.getenv("OPENAI_API_KEY")
GITHUB_TOKEN         = os.getenv("GITHUB_TOKEN")
GITHUB_REPO          = "jbirchohio/nestlein-site"
GITHUB_PATH_PREFIX   = "public/locations"
SHEET_ID             = os.getenv("SHEET_ID")
SHEET_NAME           = os.getenv("SHEET_NAME")
CREDENTIALS_FILE     = os.getenv("GOOGLE_CREDENTIALS_JSON")
ASSISTANT_ID         = os.getenv("OPENAI_ASSISTANT_ID")

# 1.5. Apify actor slugs (must be exact, case‑sensitive)
PLACE_ACTOR  = "L5MMRiysAv4Xs57uZ"            # Google Places API actor ID or slug
REVIEW_ACTOR = "Xb8osYTtOjlsgI6k9"            # Google Maps Reviews Scraper actor ID or slug

# 2. Clients
client = OpenAI(api_key=OPENAI_KEY)
gc     = gspread.service_account(filename=CREDENTIALS_FILE)
sheet  = gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)

# 3. Helpers

def load_processed_ids(path="processed_ids.json"):
    """
    Load the set of processed place IDs. Silently returns empty set if file is missing;
    warns only on malformed JSON.
    """
    try:
        with open(path, "r") as f:
            return set(json.load(f))
    except FileNotFoundError:
        return set()
    except json.JSONDecodeError as e:
        print(f"⚠️ Warning: malformed {path}: {e}")
        return set()


def slugify_location(name, address=""):
    base = (name or "unknown").lower().strip()
    match = re.search(r"\b\d{5}\b", address)
    zip_code = match.group(0) if match else "nozip"
    slug = f"{base}-{zip_code}"
    return re.sub(r"[^a-z0-9]+", "-", slug).strip("-")


def yes_list(category):
    return [list(item.keys())[0] for item in category
            if item and isinstance(item, dict) and list(item.values())[0] is True]


def format_hours(opening_hours):
    days_order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    hours_map = {h['day']: h['hours'] for h in opening_hours}
    grouped, last, group = [], None, []
    for day in days_order:
        if day in hours_map:
            hrs = hours_map[day]
            if hrs == last:
                group.append(day)
            else:
                if group:
                    grouped.append((group, last))
                group, last = [day], hrs
    if group:
        grouped.append((group, last))
    def label(days):
        return days[0] if len(days) == 1 else f"{days[0][:3]}–{days[-1][:3]}"
    return ", ".join([f"{label(g)}: {hrs}" for g, hrs in grouped])


def flatten_business_data(bd):
    lines = [
        f"Title: {bd.get('title','')}",
        f"Category: {bd.get('categoryName','')}",
        f"Address: {bd.get('address','')}",
        f"Phone: {bd.get('phone','')}",
        f"Website: {bd.get('website','')}",
        f"Rating: {bd.get('totalScore','Unknown')}",
        f"Review Count: {bd.get('reviewsCount','Unknown')}",
        "Opening Hours:",
    ]
    for h in bd.get('openingHours', []):
        lines.append(f"  - {h.get('day')}: {h.get('hours')}")
    lines.append(f"Tags: {', '.join(bd.get('categories', []))}")
    info = bd.get('additionalInfo', {})
    for section in ["Service options","Accessibility","Planning","Children"]:
        lines.append(f"{section}: {', '.join(yes_list(info.get(section, [])))}")
    reviews = bd.get('reviews') or []
    if reviews:
        lines.append("Reviews:")
        for r in reviews[:5]:
            raw = r.get('text') or ''
            text = raw.replace('\n', ' ')[:150]
            lines.append(f"  - {text}")
    return "\n".join(lines)


def add_ref_param(url, ref="roamly"):
    try:
        p = urlparse(url)
        q = parse_qs(p.query); q['ref']=[ref]
        return urlunparse(p._replace(query=urlencode(q, doseq=True)))
    except:
        return url

# 4. Apify with retry/backoff

def trigger_apify_actor(actor, payload, retries=3, backoff=2):
    url = f"https://api.apify.com/v2/acts/{actor}/runs"
    delay = 1
    for attempt in range(1, retries + 1):
        print(f"▶️  Triggering actor `{actor}` (attempt {attempt}) with payload: {payload}")
        try:
            res = requests.post(url, params={"token": APIFY_TOKEN}, json=payload, timeout=30)
            if res.status_code == 402:
                print(f"🚫  Actor `{actor}` hit memory limit (402).")
                return None
            if res.status_code in (200, 201):
                print(f"✅  Actor `{actor}` queued successfully.")
                return res.json()['data']['defaultDatasetId']
            print(f"❌  Actor `{actor}` error (status {res.status_code}): {res.text}")
        except requests.RequestException as e:
            print(f"❌  Network error for actor `{actor}` on attempt {attempt}: {e}")
        if attempt < retries:
            print(f"↻  Retrying actor `{actor}` in {delay}s…")
            time.sleep(delay)
            delay *= backoff
    print(f"❌  Actor `{actor}` failed after {retries} attempts.")
    return None


def poll_apify(dsid):
    url = f"https://api.apify.com/v2/datasets/{dsid}/items?format=json&clean=true"
    hdr = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    for _ in range(60):
        r = requests.get(url, headers=hdr, timeout=30)
        if r.status_code == 200:
            data = r.json()
            if data:
                return data
        time.sleep(5)
    raise TimeoutError("Apify polling timed out.")

# 5. AI with extended prompt

def run_assistant_conversation(bd):
    thread = client.beta.threads.create()
    prompt = '''You are analyzing structured business data for a remote work–friendly café directory called Roamly.

Use ONLY the information provided below to extract the following:

Pretend you are physically standing in the business space and doing your best to infer from the data what the experience might be like for a remote worker. Even if some fields are missing, make reasonable educated guesses based on the tone, tags, hours, category, and any other field available.

---

**Required Fields:**

1. `best_time_to_work_remotely`
2. `remote_work_summary`

---

**Optional Scoring Section:**
3. `scores` { food_quality, service, ambiance, value, experience }

---

**Remote Work Features:**
4. `remote_work_features` including wi_fi_quality, outlet_access, noise_level, seating_comfort, natural_light, stay_duration_friendliness, food_drink_options, bathroom_access, parking_availability

---

Respond ONLY with valid JSON:
{ "best_time_to_work_remotely": "...", "remote_work_summary": "...", "scores": {...}, "remote_work_features": {...} }
'''  # no echo
    flat = flatten_business_data(bd)
    client.beta.threads.messages.create(thread_id=thread.id, role="user", content=prompt + "\n\n" + flat)
    run = client.beta.threads.runs.create(thread_id=thread.id, assistant_id=ASSISTANT_ID)
    while run.status not in ("completed","failed"):
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
    msgs = client.beta.threads.messages.list(thread_id=thread.id).data
    out = msgs[0].content[0].text.value.strip()
    out = re.sub(r"^```(?:json)?|```$", "", out, flags=re.IGNORECASE).strip()
    try:
        return json.loads(out)
    except Exception as e:
        print("⚠️ AI parse error:", e, out)
        return {}

# 6. GitHub batch push remains unchanged
def batch_push_to_github(file_data_list, commit_message="Roamly Upload"):
    repo = Github(GITHUB_TOKEN).get_repo(GITHUB_REPO)
    ref = repo.get_git_ref("heads/main")
    base_tree = repo.get_git_tree(ref.object.sha)
    elements = []
    for f in file_data_list:
        blob = repo.create_git_blob(f["content"], "utf-8")
        elements.append(InputGitTreeElement(path=f["path"], mode="100644", type="blob", sha=blob.sha))
    tree = repo.create_git_tree(elements, base_tree)
    commit = repo.create_git_commit(commit_message, tree, [repo.get_git_commit(ref.object.sha)])
    ref.edit(commit.sha)


# 7. State management unchanged
def get_all_place_ids():
    return sheet.col_values(1)[1:]

def get_already_processed():
    if os.path.exists("processed_ids.json"):
        with open("processed_ids.json", "r") as f:
            return set(json.load(f))
    return set()

def save_processed(ids):
    with open("processed_ids.json", "w") as f:
        json.dump(sorted(list(ids)), f)

# 8. Main pipeline with load_processed_ids and menu_url

def process_all(limit=5):
    ids      = sheet.col_values(1)[1:]
    done     = load_processed_ids()
    newids   = [i for i in ids if i not in done]
    batch, done_now = [], set()
    for pid in newids[:limit]:
        place_ds = trigger_apify_actor(PLACE_ACTOR, {"placeIds": [pid]})
        rev_ds   = trigger_apify_actor(REVIEW_ACTOR, {"placeIds": [pid], "reviewsLimit": 50})
        if not place_ds or not rev_ds:
            continue
        place = poll_apify(place_ds)[0]
        place['reviews'] = poll_apify(rev_ds) or []

        slug = slugify_location(place.get('title'), place.get('postalCode', ""))
        structured = {
            "slug":          slug,
            "name":          place.get('title', ''),
            "place_id":      place.get('placeId', ''),
            "address":       place.get('address', ''),
            "phone_number":  place.get('phone', ''),
            "website":       add_ref_param(place.get('website', '')),
            "menu_url":      place.get('googleFoodUrl', ''),
            "logo_url":      place.get('imageUrl', ''),
            "latitude":      place.get('location', {}).get('lat', ''),
            "longitude":     place.get('location', {}).get('lng', ''),
            "hours":         format_hours(place.get('openingHours', [])),
            "open_now":      place.get('temporarilyClosed', False) and 'Closed' or 'Open',
            "tags":          place.get('categories', []),
            "review_score":  place.get('totalScore', ''),
            "review_count":  place.get('reviewsCount', ''),
        }
        ai = run_assistant_conversation(place)
        merged = {**structured, **ai}
        batch.append({"path": f"{GITHUB_PATH_PREFIX}/{slug}.json", "content": json.dumps(merged, indent=2)})
        done_now.add(pid)
        print("⏳ Waiting 10 s before next place to avoid memory spikes…")
        time.sleep(10)

    if batch:
        repo = Github(GITHUB_TOKEN).get_repo(GITHUB_REPO)
        ref  = repo.get_git_ref("heads/main")
        tree = repo.create_git_tree([
            InputGitTreeElement(path=f['path'], mode='100644', type='blob', sha=repo.create_git_blob(f['content'], 'utf-8').sha)
            for f in batch
        ], repo.get_git_tree(ref.object.sha))
        commit = repo.create_git_commit("Roamly Upload", tree, [repo.get_git_commit(ref.object.sha)])
        ref.edit(commit.sha)
        with open("processed_ids.json", "w") as f:
            json.dump(list(done.union(done_now)), f)
        print(f"✅ Uploaded {len(batch)} locations.")

if __name__ == "__main__":
    process_all()
