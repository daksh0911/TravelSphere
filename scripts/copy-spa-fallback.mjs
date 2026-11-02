import { copyFileSync, existsSync } from 'node:fs';

if (!existsSync('dist/index.html')) {
  throw new Error('dist/index.html was not created by Vite.');
}

copyFileSync('dist/index.html', 'dist/404.html');
console.log('Created dist/404.html for static Live Server SPA fallback.');
