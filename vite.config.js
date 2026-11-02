import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// https://vite.dev/config/
// Replaces the YOUR-DOMAIN-HERE placeholder in robots.txt / sitemap.xml at build time.
// Set SITE_URL (e.g. https://travelsphere.example) in your host's build environment.
const siteUrl = () => ({
  name: 'travelsphere-site-url',
  apply: 'build',
  closeBundle() {
    const url = (process.env.SITE_URL || '').replace(/\/$/, '');
    if (!url) {
      console.warn('\n[site-url] SITE_URL is not set; robots.txt and sitemap.xml still contain YOUR-DOMAIN-HERE.\n');
      return;
    }
    for (const file of ['robots.txt', 'sitemap.xml']) {
      const path = resolve('dist', file);
      if (existsSync(path)) writeFileSync(path, readFileSync(path, 'utf8').replaceAll('https://YOUR-DOMAIN-HERE', url));
    }
  },
});

export default defineConfig({
  base: '/',
  build: {
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
})

