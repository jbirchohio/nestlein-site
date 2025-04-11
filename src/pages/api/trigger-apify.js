// /api/trigger-apify.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { place_id } = req.body;
  if (!place_id) {
    return res.status(400).json({ error: 'Missing place_id' });
  }

  try {
    const response = await fetch('https://api.apify.com/v2/acts/L5MMRiysAv4Xs57uZ/runs?token=apify_api_SjW3u8R1eCawZdUXPFP0aG6SW68cYE3CJdYB', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [`https://www.google.com/maps/place/?q=place_id:${place_id}`],
        includeReviews: true,
        includeImages: true
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, runId: data.data?.id || 'Unknown', message: 'Apify actor started' });
  } catch (err) {
    return res.status(500).json({ error: 'Apify actor trigger failed', details: err.message });
  }
}
