import os
import json
import time
import openai
import gspread
from dotenv import load_dotenv

# === Load environment ===
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ASSISTANT_ID = os.getenv("OPENAI_CID_ASSISTANT_ID")
SHEET_ID = os.getenv("SHEET_ID")
SHEET_NAME = os.getenv("SHEET_NAME")
CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_JSON")
CID_FILE_PATH = os.path.expanduser("~/Desktop/scrapes/cids.txt")
LOG_FILE = "resolved_cids.json"
BATCH_SIZE = 10

# === Load Google Sheets ===
gc = gspread.service_account(filename=CREDENTIALS_FILE)
sheet = gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)

# === Load resolved CIDs ===
if os.path.exists(LOG_FILE):
    with open(LOG_FILE, "r") as f:
        resolved = json.load(f)
else:
    resolved = {}

# === Load CIDs from file ===
with open(CID_FILE_PATH, "r") as f:
    all_cids = [line.strip() for line in f if line.strip()]
unprocessed = [cid for cid in all_cids if cid not in resolved]

# === Batch utility ===
def batch(iterable, size):
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

# === Processing ===
for group in batch(unprocessed, BATCH_SIZE):
    prompt = f"Given the following Google CIDs, return only the corresponding Google Maps place_ids. Format: JSON array of objects like {{ cid: ..., place_id: ... }}:\n\n{json.dumps(group, indent=2)}"

    try:
        # Create a thread and send message
        thread = client.beta.threads.create()
        client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=prompt
        )

        # Run the assistant
        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=ASSISTANT_ID
        )

        # Poll for result
        while True:
            run_status = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
            if run_status.status in ["completed", "failed", "cancelled"]:
                break
            time.sleep(2)

        if run_status.status != "completed":
            print("❌ Assistant run failed:", run_status.status)
            continue

        messages = client.beta.threads.messages.list(thread_id=thread.id)
        latest = messages.data[0].content[0].text.value
        parsed = json.loads(latest)

        for entry in parsed:
            cid = entry.get("cid")
            place_id = entry.get("place_id")
            if cid and place_id and cid not in resolved:
                resolved[cid] = place_id
                sheet.append_row([place_id])
                print(f"✅ {cid} → {place_id}")

        with open(LOG_FILE, "w") as f:
            json.dump(resolved, f, indent=2)

    except Exception as e:
        print("❌ Error with batch:", group)
        print(e)

    time.sleep(3)

print("🏁 All done.")