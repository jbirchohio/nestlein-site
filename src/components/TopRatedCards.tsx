import LocationCard from '@/components/LocationCard';

interface Location {
  slug: string;
  name: string;
  address: string;
  logo_url?: string;
  review_score?: number;
}

interface Props {
  allLocations: Location[];
}

export default function TopRatedCards({ allLocations }: Props) {
  const topRated = [...allLocations]
    .filter((loc) => typeof loc.review_score === 'number')
    .sort((a, b) => (b.review_score ?? 0) - (a.review_score ?? 0))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {topRated.map((loc) => (
        <LocationCard key={loc.slug} location={loc} />
      ))}
      {topRated.length === 0 && (
        <p className="col-span-full text-slate-500 italic">No ratings available</p>
      )}
    </div>
  );
}
