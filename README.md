# Mindleaf

Mindleaf turns self-help and personal-development books into short daily
guided reading plans — a few minutes a day instead of a whole book at once.
It's a mobile-first, installable Progressive Web App.

## Stack

- [Vite](https://vitejs.dev/) + vanilla TypeScript (no UI framework — the
  screens are simple enough that hash-based routing and DOM templates keep
  things fast and dependency-light)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the web app
  manifest and service worker (offline caching, installability)
- Progress is stored in `localStorage`, per book

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
npm run gen-icons # regenerate the PWA icon set (public/icons, apple-touch-icon.png)
```

## Structure

- `src/data/books.ts` — the reading plans (book → ordered daily sessions).
  Swap in real content here.
- `src/views/` — the three screens: plan library, a book's day list, and
  the daily reading session.
- `src/lib/router.ts` — a small hash router (`#/`, `#/book/:id`,
  `#/book/:id/day/:n`).
- `src/lib/progress.ts` — reads/writes reading progress to `localStorage`.
- `scripts/gen-icons.mjs` — generates the PWA icon PNGs without any image
  library dependency.

## Deploying

See [NETLIFY_SETUP.md](./NETLIFY_SETUP.md).
