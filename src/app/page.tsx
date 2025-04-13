// /src/app/locations/[slug]/page.tsx
import { getLocationBySlug } from '@/lib/locations';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const { getAllLocations } = await import('@/lib/locations');
  return getAllLocations().map((loc: any) => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = getLocationBySlug(params.slug);
  return {
    title: `${data.name} | NestleIn`,
    description: `${data.name} is a remote work-friendly location at ${data.address}`,
  };
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const { data, content } = getLocationBySlug(params.slug);

  if (!data) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      {data.logo_url && (
        <Image
          src={data.logo_url}
          alt={data.name}
          width={800}
          height={400}
          className="w-full h-60 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
      <p className="text-gray-600 mb-4">{data.address} — {data.hours}</p>

      {data.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {data.tags.map((tag: string) => (
            <span key={tag} className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-800 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {data.remote_work_features && (
        <div className="bg-gray-100 rounded p-4 mb-6">
          <h2 className="font-semibold text-lg mb-2">Remote Work Features</h2>
          <ul className="text-sm space-y-1">
            {Object.entries(data.remote_work_features).map(([key, val]) => (
              <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {val}</li>
            ))}
          </ul>
        </div>
      )}

      <p>{content}</p>
    </div>
  );
}
