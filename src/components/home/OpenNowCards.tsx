import LocationCard from '@/components/LocationCard';
import { isOpenNow } from '@/utils/checkOpenNow';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface Props {
  allLocations: Location[];
}

export default function OpenNowCards({ allLocations }: Props) {
  const openLocations = allLocations
    .filter((loc) => isOpenNow(loc.hours))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {openLocations.map((loc) => (
        <LocationCard key={loc.slug} location={loc} />
      ))}
      {openLocations.length === 0 && (
        <p className="col-span-full text-slate-500 italic">No open spots right now</p>
      )}
    </div>
  );
}
