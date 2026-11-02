import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distEntryPath = resolve('dist/index.html');
const distFallbackPath = resolve('dist/404.html');

if (!existsSync(distEntryPath)) throw new Error('Build verification failed: dist/index.html is missing.');
if (!existsSync(distFallbackPath)) throw new Error('Build verification failed: dist/404.html is missing.');

const entry = readFileSync(distEntryPath, 'utf8');
const fallback = readFileSync(distFallbackPath, 'utf8');

if (entry.includes('/src/main.jsx') || entry.includes('src/main.jsx')) {
  throw new Error('Build verification failed: built index.html still points to source JSX.');
}
if (entry !== fallback) {
  throw new Error('Build verification failed: dist/404.html does not match dist/index.html.');
}

console.log('Verified production entry in dist.');

