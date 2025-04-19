import LocationCard from '@/components/LocationCard';

interface Location {
  slug: string;
  name: string;
  address: string;
  logo_url?: string;
  tags?: string[];
  hours?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface Props {
  allLocations: Location[];
  tag: string;
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

export default function FeaturedTagCards({ allLocations, tag, userCoords }: Props) {
  const tagged = allLocations
    .filter((loc) => loc.tags?.includes(tag))
    .map((loc) => ({
      ...loc,
      distance: userCoords && loc.latitude && loc.longitude
        ? getDistanceMiles(userCoords, { lat: loc.latitude, lon: loc.longitude })
        : Infinity
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {tagged.map((loc) => (
        <LocationCard key={loc.slug} location={loc} />
      ))}
      {tagged.length === 0 && (
        <p className="col-span-full text-slate-500 italic">
          No locations tagged with &quot;{tag}&quot; open near you
        </p>
      )}
    </div>
  );
}
