// src/pages/api/og/[slug].js

import { ImageResponse } from '@vercel/og';
import { getEntryBySlug } from 'astro:content';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const slug = req.params.slug;

  const entry = await getEntryBySlug('locations', slug);
  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const {
    name,
    address,
    logo_url,
    tags = [],
  } = entry.data;

  const font = await fetch(
    new URL('../../../assets/DM-Sans-Bold.ttf', import.meta.url)
  ).then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: '"DM Sans"',
          background: '#fff7ed',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ fontSize: 60, color: '#ea580c', marginBottom: 20 }}>
          {name}
        </h1>
        <p style={{ fontSize: 30, color: '#1f2937', marginBottom: 10 }}>
          {address}
        </p>
        <div style={{ fontSize: 24, color: '#475569' }}>
          {tags.slice(0, 3).join(' • ')}
        </div>
        {logo_url && (
          <img
            src={logo_url}
            alt={name}
            style={{ position: 'absolute', bottom: 40, right: 40, height: 80, width: 80, objectFit: 'cover', borderRadius: 10 }}
          />
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'DM Sans',
          data: font,
          style: 'normal',
        },
      ],
    }
  );
}
