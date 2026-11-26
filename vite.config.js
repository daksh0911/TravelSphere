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
      const path = resolve(file);
      if (existsSync(path)) {
        writeFileSync(path, readFileSync(path, 'utf8').replaceAll('https://YOUR-DOMAIN-HERE', url));
      }
    }
  },
});

// rootEntry plugin removed — Vite now outputs index.html directly

const devFallback = () => ({
  name: 'travelsphere-dev-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = req.url ? req.url.split('?')[0] : '';
      const hasFileExt = pathname.includes('.') && !pathname.endsWith('.html');
      const isInternal = pathname.startsWith('/@') || pathname.startsWith('/node_modules') || pathname.startsWith('/api') || pathname.startsWith('/src');
      if (!hasFileExt && !isInternal) {
        const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
        req.url = '/index.html' + query;
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
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(dep => !/html2canvas|jspdf|pdf-export|recharts|leaflet/.test(dep));
      },
    },
    rollupOptions: {
      input: resolve('src/index.html'),
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/react-router|@remix-run/.test(id)) return 'router';
          if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'motion';
          if (/node_modules[\\/]react(?:-dom)?[\\/]/.test(id)) return 'react';
          // Heavy chart library — only used on admin analytics page
          if (/recharts|d3-/.test(id)) return 'recharts';
          // Map library — only used on interactive world map
          if (/leaflet/.test(id)) return 'leaflet';
          // Smooth scroll — lazy loaded at runtime
          if (/lenis/.test(id)) return 'lenis';
          // GSAP — lazy loaded for homepage gallery
          if (/gsap/.test(id)) return 'gsap';
          // Sanitizer — used by API service
          if (/dompurify|isomorphic-dompurify/.test(id)) return 'purify';
        },
      },
    },
    outDir: '..',
    emptyOutDir: false,
  },
  plugins: [react(), siteUrl(), devFallback()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
