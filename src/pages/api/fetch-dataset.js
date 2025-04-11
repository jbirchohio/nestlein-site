// /api/fetch-apify-result.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { runId } = req.query;

  if (!runId) {
    return res.status(400).json({ error: 'Missing runId query parameter.' });
  }

  try {
    const datasetUrl = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=apify_api_SjW3u8R1eCawZdUXPFP0aG6SW68cYE3CJdYB`;

    const response = await fetch(datasetUrl);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(202).json({ status: 'pending', message: 'Data not ready yet.' });
    }

    return res.status(200).json({ status: 'success', result: data[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch Apify dataset.', details: err.message });
  }
}
