// src/utils/structuredData.ts

export function getStructuredData(location: {
  name: string;
  address: string;
  hours?: string;
  phone_number?: string;
  logo_url?: string;
  website?: string;
  review_score?: number;
  review_count?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: location.name,
    image: location.logo_url || undefined,
    address: location.address,
    telephone: location.phone_number || undefined,
    url: location.website || undefined,
    aggregateRating: location.review_score
      ? {
          "@type": "AggregateRating",
          ratingValue: location.review_score,
          reviewCount: location.review_count || 0,
        }
      : undefined,
    openingHours: location.hours || undefined,
  };
}
