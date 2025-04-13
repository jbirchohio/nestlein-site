import Link from 'next/link';
import Image from 'next/image';
import { getAllLocations } from '../lib/markdown';


export const dynamic = 'force-static';

export default async function HomePage() {
  const locations = getAllLocations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {locations.map(loc => (
        <Link
          key={loc.slug}
          href={`/locations/${loc.slug}`}
          className="block bg-white rounded shadow hover:shadow-lg transition p-4"
        >
          <Image
            src={loc.logo_url}
            alt={loc.title}
            width={400}
            height={200}
            className="w-full h-40 object-cover rounded mb-2"
          />
          <h2 className="text-xl font-semibold">{loc.title}</h2>
          <p className="text-sm text-gray-600">{loc.address}</p>
        </Link>
      ))}
    </div>
  );
}
