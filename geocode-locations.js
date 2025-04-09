import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import fetch from 'node-fetch';

const directory = './src/content/locations';

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'NestleIn/1.0 (your@email.com)' }
  });

  const data = await response.json();
  if (data.length === 0) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

async function processFiles() {
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.md'));

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);

    const { address, latitude, longitude } = parsed.data;

    if (!address || (latitude && longitude)) {
      console.log(`✅ Skipping ${file} — address missing or already geocoded.`);
      continue;
    }

    console.log(`📍 Geocoding: ${address} in ${file}`);
    const coords = await geocodeAddress(address);

    if (!coords) {
      console.warn(`❌ Failed to geocode ${file}`);
      continue;
    }

    parsed.data.latitude = coords.latitude;
    parsed.data.longitude = coords.longitude;

    const updated = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(fullPath, updated);
    console.log(`✅ Updated ${file} with lat/lon`);
  }

  console.log('🎉 All done!');
}

processFiles();
