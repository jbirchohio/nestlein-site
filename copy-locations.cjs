// copy-locations.js

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'data', 'locations');
const outDir = path.join(__dirname, 'src', 'content', 'locations');

// Ensure output folder exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.json'));

for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const outPath = path.join(outDir, file.replace('.json', '.md'));

  try {
    const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

    // 🚫 Remove the 'slug' field before writing
    const { slug, ...cleanedData } = data;

    const frontmatter = Object.entries(cleanedData)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const markdownContent = `---\n${frontmatter}\n---\n`;

    fs.writeFileSync(outPath, markdownContent);
    console.log(`✅ Converted: ${file}`);
  } catch (err) {
    console.error(`❌ Failed to convert ${file}: ${err.message}`);
  }
}

console.log('✅ All JSON files converted and copied to src/content/locations'); 
