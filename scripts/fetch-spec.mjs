// Downloads the backend's OpenAPI spec into openapi.json (the contract the UI is typed against).
// Usage: npm run api:spec   (backend must be running; override the URL with SIFT_API_URL)
import { writeFile } from 'node:fs/promises';

const base = process.env.SIFT_API_URL ?? 'http://localhost:8080';
const url = `${base}/v3/api-docs`;

let res;
try {
  res = await fetch(url);
} catch {
  console.error(`Cannot reach ${url}. Start the backend first (docker compose up, or mvn spring-boot:run).`);
  process.exit(1);
}
if (!res.ok) {
  console.error(`${url} answered ${res.status}`);
  process.exit(1);
}
const spec = await res.json();
await writeFile('openapi.json', JSON.stringify(spec, null, 2) + '\n');
console.log(`openapi.json updated from ${url} (${Object.keys(spec.paths).length} paths)`);
