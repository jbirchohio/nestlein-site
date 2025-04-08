// copy-locations.js
import fs from 'fs';
import path from 'path';

const sourceDir = './data/locations';
const destDir = './src/content/locations';

function copyFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src).forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    fs.copyFileSync(srcFile, destFile);
  });
  console.log('✅ Locations copied from data/ to src/content/');
}

copyFiles(sourceDir, destDir);
