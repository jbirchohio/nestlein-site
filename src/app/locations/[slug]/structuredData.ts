export function getStructuredData(location: any) {
  if (!location || !location.name || !location.address) return null;

  const {
    name,
    address,
    phone_number,
    website,
    logo_url,
    review_score,
    review_count,
  } = location;

  return {
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
  };
}
