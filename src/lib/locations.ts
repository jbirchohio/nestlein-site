// /src/lib/locations.ts
import fs from 'fs';
import path from 'path';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
}

export async function getAllLocations(): Promise<Location[]> {
  const dir = path.join(process.cwd(), 'public/locations');
  let files: string[] = [];

  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
    return [];
  }

  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      return data as Location;
    });
}
