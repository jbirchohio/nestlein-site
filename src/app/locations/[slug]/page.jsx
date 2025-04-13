// /src/app/locations/[slug]/page.tsx
import { getLocationBySlug } from '../../../lib/markdown';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export async function generateStaticParams() {
  const { getAllLocations } = await import('../../../lib/markdown');
  return getAllLocations().map(loc => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }) {
  const { data } = getLocationBySlug(params.slug);
  return {
    title: `${data.title} | NestleIn`,
    description: `${data.title} is a remote work-friendly location in ${data.address}`,
  };
}

export default function LocationPage({ params }) {
  const { data, content } = getLocationBySlug(params.slug);
  if (!data) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Image
        src={data.logo_url}
        alt={data.title}
        width={800}
        height={400}
        className="w-full h-64 object-cover rounded-md mb-6"
      />

      <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.title}</h1>
      <p className="text-gray-600 text-sm mb-4">{data.address}</p>
      <p className="text-violet-600 text-sm font-medium mb-6">Open now — until {data.hours?.split('-')?.[1]?.trim()}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {data.tags?.map((tag: string) => (
          <span key={tag} className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-800 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="prose prose-sm max-w-none text-gray-800">
        <p>{content}</p>
      </div>
    </div>
  );
}
