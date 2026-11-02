import { copyFileSync, existsSync } from 'node:fs';

if (!existsSync('index.html')) {
  throw new Error('index.html was not created by Vite.');
}

copyFileSync('index.html', '404.html');
console.log('Created 404.html for static hosting SPA fallback.');
