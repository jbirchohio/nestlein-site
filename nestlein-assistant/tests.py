import os
import time
import json
import requests
from dotenv import load_dotenv

load_dotenv()

APIFY_TOKEN = os.getenv("APIFY_TOKEN")
OUTPUT_DIR = "output"

def trigger_apify_reviews(place_id):
    url = "https://api.apify.com/v2/acts/compass~google-maps-reviews-scraper/runs"
    res = requests.post(
    url,
    params={"token": APIFY_TOKEN},
    json={
        "placeIds": [place_id],
        "maxReviews": 12  # 👈 This caps reviews at 12 total
    }
)
    if res.status_code in [200, 201]:
        return res.json()["data"]["defaultDatasetId"]
    print("❌ Failed to trigger Apify actor")
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
        time.sleep(3)
    raise TimeoutError("🕒 Timed out waiting for Apify results.")

def save_to_output(place_id, data):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, f"{place_id}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Saved reviews to {filepath}")

if __name__ == "__main__":
    # Replace with your test Place ID
    place_id = "ChIJrTLr-GyuEmsRBfy61i59si0"  # Example: Google Sydney
    run_id = trigger_apify_reviews(place_id)
    if run_id:
        result = poll_apify(run_id)
        save_to_output(place_id, result)
    else:
        print("❌ Review scraping failed.")
