// copy-locations.js
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const sourceDir = './data/locations';
const destDir = './src/content/locations';

function convertToFrontmatter(json) {
  // Limit what goes in frontmatter to safe top-level fields
  const {
    name,
    address,
    phone_number,
    website_url,
    restaurant_score,
    best_time_to_work_remotely,
    slug,
    logo_url,
    tags,
    remote_work_features
  } = json;

  const frontmatter = {
    name,
    address,
    phone_number,
    website_url,
    restaurant_score,
    best_time_to_work_remotely,
    slug,
    logo_url,
    tags,
    remote_work_features
  };

  // Clean out undefined/null values
  Object.keys(frontmatter).forEach(key => {
    if (frontmatter[key] === undefined || frontmatter[key] === null) {
      delete frontmatter[key];
    }
  });

  return `---\n${yaml.dump(frontmatter)}---\n`;
}

function copyAndConvertFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src).forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, path.basename(file, '.json') + '.md');

    try {
      const json = JSON.parse(fs.readFileSync(srcFile, 'utf-8'));
      const mdContent = convertToFrontmatter(json);
      fs.writeFileSync(destFile, mdContent);
      console.log(`✅ Converted: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to convert ${file}:`, err.message);
    }
  });

  console.log('✅ All JSON files converted and copied to src/content/locations');
}

copyAndConvertFiles(sourceDir, destDir);
