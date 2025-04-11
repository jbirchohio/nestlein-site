import { json } from 'astro:content';
import base64 from 'base-64';

export async function POST({ request }) {
  const { content, place_id } = await request.json();

  function parseGemini(content) {
    const parsed = {};
    const features = {};
    const tagPattern = /\*\*Tags\*\*: (.+)/i;

    // Field extraction pattern
    const fields = [
      'Restaurant Name', 'Website URL', 'Logo URL', 'Address', 'Phone Number',
      'Hours of Operation', 'Restaurant Score', 'Best Time to Work Remotely',
      'Wi-Fi Quality', 'Outlet Access', 'Noise Level', 'Seating Comfort',
      'Natural Light', 'Stay Duration Friendliness', 'Food & Drink Options',
      'Bathroom Access', 'Parking Availability'
    ];

    fields.forEach(label => {
      const regex = new RegExp(`\\*\\*${label}\\*\\*: (.*?)\\n`, 'i');
      const match = content.match(regex);
      if (match) {
        const key = label.toLowerCase().replace(/[\s&]/g, '_').replace(/-/, '').replace(/__/g, '_');
        if (label.includes('Wi-Fi') || label.includes('Outlet') || label.includes('Noise') || label.includes('Seating') || label.includes('Natural') || label.includes('Stay') || label.includes('Food') || label.includes('Bathroom') || label.includes('Parking')) {
          features[key] = match[1].trim();
        } else if (label === 'Restaurant Score') {
          parsed['restaurant_score'] = parseFloat(match[1].match(/[\d.]+/)?.[0]) || 0;
        } else {
          parsed[key] = match[1].trim();
        }
      }
    });

    const tagsMatch = content.match(tagPattern);
    if (tagsMatch) {
      parsed.tags = tagsMatch[1].split(',').map(tag => tag.trim());
    }

    parsed.remote_work_features = features;
const cityOrZip = parsed.address?.match(/\b\d{5}(?:-\d{4})?\b/)?.[0] || parsed.address?.split(',')[1]?.trim().toLowerCase().replace(/\s+/g, '-');
parsed.slug = `${parsed.restaurant_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cityOrZip}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
    parsed.name = parsed.restaurant_name;
    parsed.google_place_id = place_id;
    parsed.logo_url = parsed.logo_url || "";

    return parsed;
  }

  try {
    const data = parseGemini(content);
    const stringified = JSON.stringify(data, null, 2);
    return new Response(JSON.stringify({
      parsed_json: data,
      base64_output: base64.encode(stringified),
      slug: data.slug,
      filename: `${place_id}.json`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
