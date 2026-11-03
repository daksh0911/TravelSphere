import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const siteUrl = () => ({
  name: 'travelsphere-site-url',
  apply: 'build',
  closeBundle() {
    const url = (process.env.SITE_URL || '').replace(/\/$/, '');
    if (!url) return;
    for (const file of ['robots.txt', 'sitemap.xml']) {
      const path = resolve(file);
      if (existsSync(path)) {
        writeFileSync(path, readFileSync(path, 'utf8').replaceAll('https://YOUR-DOMAIN-HERE', url));
      }
    }
  },
});

const rootEntry = () => ({
  name: 'travelsphere-root-entry',
  closeBundle() {
    const builtEntry = resolve('app.html');
    const rootEntryPath = resolve('index.html');
    if (!existsSync(builtEntry)) throw new Error('Vite did not create the production app entry.');
    copyFileSync(builtEntry, rootEntryPath);
    unlinkSync(builtEntry);
  },
});

const devFallback = () => ({
  name: 'travelsphere-dev-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = req.url ? req.url.split('?')[0] : '';
      const hasFileExt = pathname.includes('.') && !pathname.endsWith('.html');
      const isInternal = pathname.startsWith('/@') || pathname.startsWith('/node_modules') || pathname.startsWith('/api') || pathname.startsWith('/src');
      if (!hasFileExt && !isInternal) {
        const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
        req.url = '/app.html' + query;
      }
      next();
    });
  },
});

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: './',
  build: {
    rollupOptions: {
      input: resolve('src/app.html'),
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/react-router|@remix-run/.test(id)) return 'router';
          if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'motion';
          if (/node_modules[\\/]react(?:-dom)?[\\/]/.test(id)) return 'react';
        },
      },
    },
    outDir: '..',
    emptyOutDir: false,
  },
  plugins: [react(), siteUrl(), rootEntry(), devFallback()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
