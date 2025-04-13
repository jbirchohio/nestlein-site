import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const locationsDir = path.join(process.cwd(), 'data/locations');

export function getAllLocations() {
  const files = fs.readdirSync(locationsDir);
  return files.map(filename => {
    const filePath = path.join(locationsDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return data;
  });
}

export function getLocationBySlug(slug) {
  const fullPath = path.join(locationsDir, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return { data, content };
}
