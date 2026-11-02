import { copyFileSync, existsSync, mkdirSync, cpSync } from 'node:fs';

if (!existsSync('index.html')) {
  throw new Error('Production root index.html was not created by Vite.');
}

copyFileSync('index.html', '404.html');
console.log('Created 404.html for static hosting SPA fallback.');

// Ensure dist/ exists and contains complete copy for Vercel
if (!existsSync('dist')) mkdirSync('dist', { recursive: true });
if (existsSync('index.html')) copyFileSync('index.html', 'dist/index.html');
if (existsSync('404.html')) copyFileSync('404.html', 'dist/404.html');
if (existsSync('assets')) cpSync('assets', 'dist/assets', { recursive: true });
if (existsSync('public')) cpSync('public', 'dist', { recursive: true });
console.log('Synchronized dist/ directory for Vercel production hosting.');
