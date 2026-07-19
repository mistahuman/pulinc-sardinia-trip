# PULINC · Sardinia 2026

Trip site for the Pulinc — Sardinia, August 2026.
Live at [mistahuman.github.io/pulinc-sardinia-trip](https://mistahuman.github.io/pulinc-sardinia-trip/).

Astro 6 · Svelte 5 · Skeleton 4 · Tailwind 4. Static, deployed to GitHub Pages on
every push to `main`. Built on
[astro-svelte-skeleton-starter](https://github.com/mistahuman/astro-svelte-skeleton-starter).

## Commands

```bash
npm install
npm run dev      # dev server
npm run build    # astro check + build to ./dist
npm run lint     # ESLint
npm run format   # Prettier
```

## Adding a stop

One markdown file per stop in `src/content/itinerary/`, named `YYYY-MM-DD-slug.md`.
Only `date`, `type` and `title` are required.

```markdown
---
date: '2026-08-15'
type: 'ristorante'
title: 'Cena da qualche parte'
time: '20:30 - 23:00'
location: 'Nome del posto'
address: 'Via Tal dei Tali 1, Cagliari' # → Google Maps button
link: 'https://...' # → booking button
notes: 'Portare il costume'
---

Free markdown, shown when the stop is expanded.
```

Types: `partenza` `traghetto` `trasferimento` `ritorno` `hotel` `villa`
`ristorante` `attivita`. The schema in `src/content.config.ts` fails the build on
a bad field; icons and colours per type are in `src/lib/eventMeta.ts`.

Itinerary and calendar read the same files, so one markdown updates both. Days
with nothing planned still show up as "Chill". Trip dates live in
`src/lib/trip.ts`.

## Notes

- **Sub-path deploy.** The site isn't served from `/`. Never `href="/"` — always
  `import.meta.env.BASE_URL`.
- **Logo.** Versions in `src/lib/crests.ts`, PNGs in `public/crests/` (`-clean` =
  background removed). Header and favicon use the last entry, so adding a version
  is one line plus the PNG. Untouched scans are archived in `src/assets/crests/`.
- **One hydrated component**, `Countdown.svelte`. Everything else is static HTML;
  stops expand with native `<details>`.
