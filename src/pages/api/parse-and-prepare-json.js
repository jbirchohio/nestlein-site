import base64 from "base-64";

/**
 * Parses content into structured JSON
 */
function parseContent(content) {
  const parsedData = {};
  const remoteFeatures = {};

  const pattern = /\*\*(.+?)\*\*: (.*?)(?=\n\*\*|$)/gs;
  const matches = [...content.matchAll(pattern)];

  for (const match of matches) {
    const key = match[1].trim().toLowerCase().replace(/ /g, "_");
    const value = match[2].trim().replace(/\n/g, " ").replace(/  +/g, " ");

    if (
      [
        "wi-fi_quality",
        "outlet_access",
        "noise_level",
        "seating_comfort",
        "natural_light",
        "stay_duration_friendliness",
        "food_&_drink_options",
        "bathroom_access",
        "parking_availability"
      ].includes(key)
    ) {
      const remapped = key
        .replace("wi-fi", "wi_fi")
        .replace("food_&_drink_options", "food_drink_options");
      remoteFeatures[remapped] = value;
    } else if (key === "tags") {
      parsedData["tags"] = value.split(",").map((tag) => tag.trim());
    } else if (key === "restaurant_score") {
      const scoreMatch = value.match(/[\d.]+/);
      parsedData[key] = scoreMatch ? parseFloat(scoreMatch[0]) : 0;
    } else {
      parsedData[key] = value;
    }
  }

  if ("restaurant_name" in parsedData) {
    parsedData["name"] = parsedData["restaurant_name"];
    delete parsedData["restaurant_name"];
  }

  // Slug generation
  const address = parsedData.address || "";
  const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
  const zipOrCity = zipMatch
    ? zipMatch[0]
    : address.includes(",")
      ? address.split(",")[1].trim().toLowerCase().replace(/\s+/g, "-")
      : "unknown";

  let nameSlug = parsedData.name?.toLowerCase().replace(/['&]/g, (c) =>
    c === "&" ? "and" : ""
  );
  nameSlug = nameSlug?.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  parsedData.slug = `${nameSlug}-${zipOrCity}`;
  parsedData.remote_work_features = remoteFeatures;

  if (!parsedData.logo_url) {
    parsedData.logo_url = "";
  }

  return parsedData;
}

/**
 * Main handler function — usable as API route or importable function
 */
export default async function handler(req, res) {
  try {
    const input = req.body;

    if (!input || !input.response) {
      return res.status(400).json({ error: "Missing 'response' in request body" });
    }

    const data = parseContent(input.response);

    // Extract Place ID
    const placeId =
      input.place_id ||
      input["Place ID"] ||
      Object.entries(input).find(
        ([k]) => k.toLowerCase().trim() === "place_id"
      )?.[1];

    if (!placeId) {
      return res.status(400).json({
        error: `Missing 'place_id' in input. Keys: ${Object.keys(input).join(", ")}`
      });
    }

    data.google_place_id = placeId;
    const jsonStr = JSON.stringify(data, null, 2);
    const base64Str = base64.encode(jsonStr);

    return res.status(200).json({
      parsed_json: data,
      base64_output: base64Str,
      slug: data.slug,
      filename: `${data.slug}.json`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
