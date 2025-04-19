import LocationCard from '@/components/LocationCard';
import { isOpenNow } from '@/utils/checkOpenNow';

interface Location {
  slug: string;
  name: string;
  address: string;
  logo_url?: string;
  tags?: string[];
  hours?: string;
}

interface Props {
  allLocations: Location[];
  tag: string;
}

export default function FeaturedTagCards({ allLocations, tag }: Props) {
  const tagged = allLocations
    .filter((loc) => loc.tags?.includes(tag))
    .filter((loc) => isOpenNow(loc.hours)) // Optional: only show open ones
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {tagged.map((loc) => (
        <LocationCard key={loc.slug} location={loc} />
      ))}
      {tagged.length === 0 && (
        <p className="col-span-full text-slate-500 italic">No locations tagged with "{tag}"</p>
      )}
    </div>
  );
}
