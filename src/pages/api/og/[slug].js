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
  if (!entry) return new Response('Not Found', { status: 404 });

  const { name, address, logo_url } = entry.data;

  return new ImageResponse(
    `
    <div style="font-family: DM Sans, sans-serif; background: #fff7ed; width: 100%; height: 100%; display: flex; flex-direction: column; padding: 60px; justify-content: center; align-items: flex-start;">
      ${logo_url
        ? `<img src="${logo_url}" alt="${name}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;margin-bottom:20px;" />`
        : ''
      }
      <h1 style="font-size:60px;color:#ea580c;margin-bottom:20px;">${name}</h1>
      <p style="font-size:30px;color:#1f2937;">${address}</p>
      <p style="font-size:20px;color:#6b7280;margin-top:30px;">NestleIn – Work Comfortably</p>
    </div>
    `,
    {
      width: 1200,
      height: 630,
      headers: {
        'Content-Type': 'image/png'
      }
    }
  );
}
