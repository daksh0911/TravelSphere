# TravelSphere

A premium travel booking front end: curated destinations, tour packages, hotels, vehicles and role-based dashboards.

**Stack:** React 19, Vite, React Router (BrowserRouter), framer-motion, GSAP + ScrollTrigger, Lenis, lucide-react.

## Getting started
```bash
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint
```
Copy `.env.example` to `.env` and fill in values. `.env` is git-ignored.

## VS Code Go Live
This is a Vite/React app, so VS Code Live Server must serve the compiled `dist/` folder rather than the JSX source files.

1. Run `npm run build` after source changes.
2. Open the `travel-management` folder in VS Code.
3. Click **Go Live** in the status bar.
4. Open `http://127.0.0.1:5501/`.

The workspace is already configured with `liveServer.settings.root` set to `/dist`. The build also creates `dist/404.html`, so refreshing nested routes such as `/support`, `/destinations/kyoto`, or `/packages` continues to load the React app in a static server. Local image assets are optimized and served from `public/`, so the first render does not depend on remote image hosts. Use `npm run dev` when you want automatic hot reload while editing.

## Deployment
- **Vercel:** `vercel.json` rewrites every path to `index.html` (needed for BrowserRouter deep links such as `/destinations/kyoto`), sets security headers and long-lived caching for hashed assets.
- **Netlify / Cloudflare Pages:** `public/_headers` carries the same security headers. Add an SPA fallback (`/* /index.html 200`).
- **Before launch:** replace `https://YOUR-DOMAIN-HERE` in `public/robots.txt` and `public/sitemap.xml` with your real domain.

## Project layout
```
src/
  components/   common (SmartImage, ErrorBoundary, motion helpers), layout (Navbar, Footer), specific cards
  context/      AuthContext
  data/         destinations.js, the single source for destination content
  hooks/        usePageTitle
  layouts/      MainLayout (skip link, navbar, main landmark, footer)
  pages/        customer, auth, role dashboards, NotFound
  routes/       AppRoutes (lazy routes, route transitions, protected routes)
  styles/       variables.css (design tokens), global.css
public/         destination-images, vehicle-images (WebP), robots.txt, sitemap.xml, llms.txt
server/         backend
```

## Design system
Colours, fonts, radii and shadows live in `src/styles/variables.css` ("Timeless Elegance": cream, copper, Playfair Display + Plus Jakarta Sans). Use the tokens, not raw hex values.

## Motion
Smooth scrolling (Lenis), GSAP-pinned destination gallery, image reveals and page transitions all respect `prefers-reduced-motion`.
