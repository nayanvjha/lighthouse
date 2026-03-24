# Nayan Kumar Developer Portfolio

Immersive React + Vite portfolio built with a cinematic HUD style, scroll-driven transitions, and optimized 3D sections.

## Tech Stack

- React 18 + Vite
- Three.js via `@react-three/fiber` and `@react-three/drei`
- GSAP + ScrollTrigger
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Lenis smooth scrolling

## Features

- Hero Mission Control intro with animated 3D scene
- Section-level storytelling (About, Services, Projects, Experience, Achievements)
- CSS Dyson Sphere tech visualization + mobile fallback grid
- Mars-themed contact terminal with optional Formspree support
- Global portal transitions, loading screen, Konami easter egg, custom cursor
- Reduced motion and lower-end GPU performance fallbacks

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## Environment Variables

Create `.env` as needed:

```bash
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

When `VITE_FORMSPREE_ENDPOINT` is not set, contact submission falls back to `mailto:`.

## Deployment (Vercel)

- Project includes `vercel.json` with Vite build/output settings and SPA rewrite.
- Connect repository in Vercel and deploy with defaults:
	- Build Command: `npm run build`
	- Output Directory: `dist`

## Post-Deployment Checklist

- Confirm contact form submission path (`Formspree` or mailto fallback)
- Validate Open Graph preview using `/og-image.svg`
- Run Lighthouse on deployed URL
- Verify responsive behavior at key breakpoints

