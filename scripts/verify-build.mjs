import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const entryPath = resolve('index.html');
const fallbackPath = resolve('404.html');

if (!existsSync(entryPath)) throw new Error('Build verification failed: index.html is missing.');
if (!existsSync(fallbackPath)) throw new Error('Build verification failed: 404.html is missing.');

const entry = readFileSync(entryPath, 'utf8');
const fallback = readFileSync(fallbackPath, 'utf8');

if (entry.includes('/src/main.jsx') || entry.includes('src/main.jsx')) {
  throw new Error('Build verification failed: index.html still points to source JSX.');
}
if (!entry.includes('./assets/')) {
  throw new Error('Build verification failed: index.html has no local production bundle.');
}
if (entry !== fallback) {
  throw new Error('Build verification failed: 404.html does not match index.html.');
}

const localReferences = [...entry.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map(([, reference]) => reference);
const missingReferences = localReferences.filter(reference => !existsSync(resolve(reference)));
if (missingReferences.length > 0) {
  throw new Error(`Build verification failed: missing local assets: ${missingReferences.join(', ')}`);
}

console.log(`Verified production entry and ${localReferences.length} local assets.`);
