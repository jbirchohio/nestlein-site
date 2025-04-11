export async function POST({ request }: { request: Request }) {
  const { place_id } = await request.json();

  if (!place_id) {
    return new Response(JSON.stringify({ error: 'Missing place_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const apifyRes = await fetch(
      'https://api.apify.com/v2/acts/L5MMRiysAv4Xs57uZ/runs?token=apify_api_SjW3u8R1eCawZdUXPFP0aG6SW68cYE3CJdYB',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [`https://www.google.com/maps/place/?q=place_id:${place_id}`],
          includeReviews: true,
          includeImages: true
        })
      }
    );

    const data = await apifyRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        runId: data.data?.id || 'Unknown',
        message: 'Apify actor started'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Apify actor trigger failed',
        details: err.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
