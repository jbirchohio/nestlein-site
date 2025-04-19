import type { Metadata } from 'next';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {

  const url = `https://nestlein-site.vercel.app/locations/${params.slug}.json`;

  let location: any = null;

  try {
    const res = await fetch(url, {
      // Cache for 1 hour to reduce fetch load & speed up rendering
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Location not found');
    location = await res.json();
  } catch {
    // Fallback metadata for missing/broken JSON
    return {
      title: 'Roamly — Discover Remote Work-Friendly Spots',
      description: 'Find cozy cafés, cowork spots, and hidden gems perfect for working remotely.',
    };
  }

  const {
    name,
    address,
    remote_work_summary,
    tags = [],
    remote_work_features = {},
    logo_url,
    phone_number,
    website,
    review_score,
    review_count,
  } = location;

  const featurePhrases = [
    remote_work_features.wi_fi_quality ? 'fast Wi-Fi' : '',
    remote_work_features.outlet_access ? 'outlet access' : '',
    remote_work_features.noise_level ? `${remote_work_features.noise_level.toLowerCase()} noise` : '',
    remote_work_features.seating_comfort ? `${remote_work_features.seating_comfort.toLowerCase()} seating` : '',
    remote_work_features.natural_light ? 'natural light' : '',
    remote_work_features.food_drink_options ? 'coffee and snacks' : '',
    remote_work_features.bathroom_access ? 'bathroom access' : '',
    remote_work_features.parking_availability ? 'easy parking' : '',
  ].filter(Boolean).join(', ');

  const city = address?.split(',')[1]?.trim() || 'your city';

  const title = `${name} — Remote Work-Friendly Spot in ${city}`;
  const description = remote_work_summary || `Discover ${name}, a remote work-friendly place with ${featurePhrases}. Perfect for getting things done.`;

  const keywords = [
    name,
    'remote work café',
    'cowork-friendly spot',
    ...tags,
    featurePhrases,
    `best cafe to work from in ${city}`,
    `wifi coffee shop ${city}`,
    `quiet workspace ${city}`,
    `places with outlets and coffee in ${city}`,
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      images: [
        {
          url: logo_url || 'https://nestlein-site.vercel.app/placeholder.jpg',
          width: 800,
          height: 600,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logo_url || 'https://nestlein-site.vercel.app/placeholder.jpg'],
    },
    // 👇 Optional bonus: JSON-LD injection (rendered manually in page.tsx head)
    other: {
      structuredData: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name,
        address,
        telephone: phone_number,
        url: website || 'https://roamly.app',
        image: logo_url,
        aggregateRating: review_score
          ? {
              "@type": "AggregateRating",
              ratingValue: review_score,
              reviewCount: review_count || 1,
            }
          : undefined,
      },
    },
  };
}
