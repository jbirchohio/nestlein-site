import LocationCard from '@/components/LocationCard';

interface Location {
  slug: string;
  name: string;
  address: string;
  logo_url?: string;
  review_score?: number;
  latitude?: number;
  longitude?: number;
  hours?: string;
  tags?: string[];
  distance?: number;
}

interface Props {
  allLocations: Location[];
  userCoords: { lat: number; lon: number } | null;
}

function getDistanceMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 3958.8;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLon = (b.lon - a.lon) * (Math.PI / 180);
  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);

  const aCalc = Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
  return R * c;
}

export default function TopRatedCards({ allLocations, userCoords }: Props) {
  const topRated = [...allLocations]
    .filter((loc) => typeof loc.review_score === 'number')
    .map((loc) => ({
      ...loc,
      distance: userCoords && loc.latitude && loc.longitude
        ? getDistanceMiles(userCoords, { lat: loc.latitude, lon: loc.longitude })
        : Infinity
    }))
    .filter((loc) => loc.distance <= 5)
    .sort((a, b) => {
      const ratingDiff = (b.review_score ?? 0) - (a.review_score ?? 0);
      return ratingDiff !== 0 ? ratingDiff : a.distance - b.distance;
    })
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {topRated.length > 0 ? (
        topRated.map((loc) => (
          <LocationCard key={loc.slug} location={loc} />
        ))
      ) : (
        <p className="col-span-full text-slate-500 italic">
          No highly rated spots within 5 miles
        </p>
      )}
    </div>
  );
}
