import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'registry.json');

export function readRegistry() {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
}

export function writeRegistry(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}