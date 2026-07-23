# pulinc-sardinia-trip

Trip site for the Pulinc — Sardinia, August 2026. Itinerary and calendar read the
same markdown files, so one stop updates both.

**Live:** https://mistahuman.github.io/pulinc-sardinia-trip/

## Stack

Astro 6 · Svelte 5 · Skeleton 5 · Tailwind 4

## Run

```bash
npm install
npm run dev
npm run build    # astro check + build to ./dist
```

## Usage

One markdown file per stop in `src/content/itinerary/`, named `YYYY-MM-DD-slug.md`.
Only `date`, `type` and `title` are required.

```markdown
---
date: '2026-08-15'
type: 'food'
title: 'Cena da qualche parte'
time: '20:30 - 23:00'
location: 'Nome del posto'
address: 'Via Tal dei Tali 1, Cagliari'
mapsLink: 'https://...'
infoLink: 'https://...'
notes: 'Portare il costume'
---

Free markdown, shown when the stop is expanded.
```

Types: `travel` `ferry` `stay` `food` `beach` `activity` `birthday`.

## License

MIT
