// /lib/locations.ts
import fs from 'fs';
import path from 'path';

const locationsDir = path.join(process.cwd(), 'data/locations');

export function getAllLocations() {
  const files = fs.readdirSync(locationsDir);
  return files
    .filter((file) => file.endsWith('.json'))
    .map((filename) => {
      const filePath = path.join(locationsDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      return data;
    });
}

export function getLocationBySlug(slug: string) {
  const filePath = path.join(locationsDir, `${slug}.json`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);
  return { data };
}
