import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const siteUrl = () => ({
  name: 'travelsphere-site-url',
  apply: 'build',
  closeBundle() {
    const url = (process.env.SITE_URL || '').replace(/\/$/, '');
    if (!url) return;
    for (const file of ['robots.txt', 'sitemap.xml']) {
      const path = resolve('dist', file);
      if (existsSync(path)) writeFileSync(path, readFileSync(path, 'utf8').replaceAll('https://YOUR-DOMAIN-HERE', url));
    }
  },
});

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/react-router|@remix-run/.test(id)) return 'router';
          if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'motion';
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
        },
      },
    },
  },
  plugins: [react(), siteUrl()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
