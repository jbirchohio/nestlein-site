import { getLocationBySlug } from '../../../lib/markdown';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';

export async function generateStaticParams() {
  const { getAllLocations } = await import('../../../lib/markdown');
  return getAllLocations().map(loc => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = getLocationBySlug(params.slug);
  return {
    title: `${data.title} | NestleIn`,
    description: `${data.title} is a remote work-friendly location in ${data.address}`,
  };
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const { data, content } = getLocationBySlug(params.slug);

  if (!data) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Image
        src={data.logo_url}
        alt={data.title}
        width={800}
        height={400}
        className="w-full h-60 object-cover rounded mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      <p className="text-gray-600 mb-4">{data.address} — {data.hours}</p>
      <p>{content}</p>
    </div>
  );
}
