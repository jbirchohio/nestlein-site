export async function POST({ request }) {
  const { place_id } = await request.json();

  if (!place_id) {
    return new Response(JSON.stringify({ error: 'Missing place_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apifyURL = 'https://api.apify.com/v2/acts/L5MMRiysAv4Xs57uZ/runs?token=apify_api_SjW3u8R1eCawZdUXPFP0aG6SW68cYE3CJdYB';

  const response = await fetch(apifyURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startUrls: [`https://www.google.com/maps/place/?q=place_id:${place_id}`],
      includeReviews: true,
      includeImages: true,
    }),
  });

  const result = await response.json();

  return new Response(JSON.stringify({ success: true, runId: result.data?.id || 'Unknown' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
