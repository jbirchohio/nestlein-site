// src/pages/api/og/[slug].js
import { ImageResponse } from '@vercel/og';
import { getEntryBySlug } from 'astro:content';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.pathname.split('/').pop();

  const entry = await getEntryBySlug('locations', slug);
  if (!entry) {
    return new Response('Not Found', { status: 404 });
  }

  const { name, address, logo_url } = entry.data;

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: 'DM Sans, sans-serif',
          background: '#fff7ed',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {logo_url && (
          <img
            src={logo_url}
            alt={name}
            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '0.5rem', marginBottom: 20 }}
          />
        )}
        <h1 style={{ fontSize: 60, color: '#ea580c', marginBottom: 20 }}>{name}</h1>
        <p style={{ fontSize: 30, color: '#1f2937' }}>{address}</p>
        <p style={{ fontSize: 20, color: '#6b7280', marginTop: 30 }}>NestleIn – Work Comfortably</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'DM Sans',
          data: await fetch('https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2').then(res =>
            res.arrayBuffer()
          ),
          style: 'normal',
        },
      ],
    }
  );
}
