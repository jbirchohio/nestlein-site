// src/pages/sitemap.xml.js

import { getCollection } from 'astro:content';

export async function get() {
  const locations = await getCollection('locations');
  const base = 'https://nestlein-site.vercel.app';

  const locationUrls = locations.map((entry) => {
    return `<url>
      <loc>${base}/locations/${entry.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${base}</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    ${locationUrls.join('\n')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
