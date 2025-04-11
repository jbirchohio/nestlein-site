import re
import json
import base64

def parse_content(content):
    parsed_data = {}
    remote_features = {}

    pattern = r'\*\*(.+?)\*\*: (.*?)(?=\n\*\*|$)'
    matches = re.findall(pattern, content, re.DOTALL)

    for key, value in matches:
        slug_key = key.strip().lower().replace(" ", "_")
        clean_value = value.strip().replace('\n', ' ').replace('  ', ' ')

        if slug_key in [
            "wi-fi_quality", "outlet_access", "noise_level", "seating_comfort",
            "natural_light", "stay_duration_friendliness", "food_&_drink_options",
            "bathroom_access", "parking_availability"
        ]:
            remote_features[slug_key.replace("wi-fi", "wi_fi").replace("food_&_drink_options", "food_drink_options")] = clean_value
        elif slug_key == "tags":
            parsed_data["tags"] = [tag.strip() for tag in clean_value.split(",")]
        elif slug_key == "restaurant_score":
            try:
                parsed_data[slug_key] = float(re.findall(r"[\d.]+", clean_value)[0])
            except:
                parsed_data[slug_key] = 0
        else:
            parsed_data[slug_key] = clean_value

    # Rename restaurant_name → name
    if "restaurant_name" in parsed_data:
        parsed_data["name"] = parsed_data.pop("restaurant_name")

    # Build unique slug: name + ZIP
    address = parsed_data.get("address", "")
    zip_match = re.search(r"\b\d{5}(?:-\d{4})?\b", address)
    zip_or_city = zip_match.group(0) if zip_match else address.split(',')[1].strip().lower().replace(' ', '-') if ',' in address else 'unknown'

    name_slug = parsed_data["name"].lower().replace("'", "").replace("&", "and")
    name_slug = re.sub(r'[^a-z0-9]+', '-', name_slug).strip('-')
    parsed_data["slug"] = f"{name_slug}-{zip_or_city}"

    # Attach remote features
    parsed_data["remote_work_features"] = remote_features

    # Fallback logo
    if "logo_url" not in parsed_data:
        parsed_data["logo_url"] = ""

    return parsed_data

# 🔁 Step 1: Parse response from Gemini
raw = input_data['response']
data = parse_content(raw)

# 🔁 Step 2: Extract Place ID from any field
available_keys = list(input_data.keys())
place_id = input_data.get('place_id') or input_data.get('Place ID') or next(
    (input_data[k] for k in available_keys if k.lower().strip() == "place_id"),
    None
)

if not place_id:
    raise ValueError(f"🚨 Missing 'place_id' in input_data. Keys: {available_keys}")

# 🔁 Step 3: Finalize output
data["google_place_id"] = place_id
json_str = json.dumps(data, indent=2)
base64_str = base64.b64encode(json_str.encode("utf-8")).decode("utf-8")

return {
    "parsed_json": data,
    "base64_output": base64_str,
    "slug": data["slug"],
    "filename": f"{data['slug']}.json"
}
