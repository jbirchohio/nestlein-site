from process_and_push_json import run_assistant_conversation, push_to_github

# Replace this with your test data structure
apify_output = {
    "business_data": {
        "title": "A Walk in the Park Cafe",
        "url": "http://www.awalkintheparkcafe.com",
        "address": "1491 Aster Ave, Akron, OH 44301",
        "phone": "(330) 536-9255",
        "logo": "https://example.com/logo.png"
    },
    "review_summary": "Friendly staff, great pancakes, and a cozy atmosphere. Wi-Fi mentioned in multiple reviews as fast and reliable."
}

print("⏳ Running Assistant...")
summary = run_assistant_conversation(apify_output)
print("✅ Assistant Output:\n", summary)

print("⏳ Pushing to GitHub...")
slug = "a-walk-in-the-park-cafe-44301"
success = push_to_github(slug, summary)
print("✅ GitHub push status:", "Success" if success else "❌ Failed")
