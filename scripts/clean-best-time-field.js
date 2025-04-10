import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('./data/locations');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(raw);

  if (typeof data.best_time_to_work_remotely === 'string') {
    const original = data.best_time_to_work_remotely;
    const cleaned = original.replace(/---\s*##Remote Work Features##/i, '').trim();

    if (original !== cleaned) {
      data.best_time_to_work_remotely = cleaned;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`🧼 Cleaned: ${file}`);
    }
  }
}
