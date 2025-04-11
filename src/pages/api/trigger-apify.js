// /api/trigger-apify.js (hosted on Vercel, Netlify, or other)
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { place_id } = req.body;

  if (!place_id) return res.status(400).json({ error: 'Missing place_id' });

  const apifyToken = process.env.APIFY_TOKEN;
  const taskId = process.env.APIFY_TASK_ID;

  const apifyUrl = `https://api.apify.com/v2/actor-tasks/${taskId}/run-sync?token=${apifyToken}`;

  const payload = {
    placeIds: [place_id],
    includeReviews: true,
    includePhotos: true,
    maxCrawledPlaces: 1
  };

  try {
    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const datasetId = result.defaultDatasetId;

    return res.status(200).json({
      status: 'Triggered successfully',
      datasetId,
      place_id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to trigger Apify' });
  }
}
