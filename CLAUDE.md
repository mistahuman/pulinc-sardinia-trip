# pulinc-sardinia-trip — Claude Code context

Static trip site, built on `astro-svelte-skeleton-starter`. Deployed to GitHub Pages
on every push to `main`.

## Commands

```bash
npm run dev
npm run build    # astro check + build to ./dist
npm run lint
npm run format
```

## Content model

One markdown file per stop in `src/content/itinerary/`, named `YYYY-MM-DD-slug.md`.
Itinerary and calendar read the same files, so a single file updates both views.
Days with nothing planned still render as "Chill". Trip dates live in `src/lib/trip.ts`.

Required frontmatter: `date`, `type`, `title`. Optional: `time`, `location`,
`address`, `mapsLink`, `infoLink`, `notes`.

The schema in `src/content.config.ts` **fails the build** on a bad field — that is
intentional, do not loosen it to make a build pass.

Types: `travel` `ferry` `stay` `food` `beach` `activity` `birthday`. The Italian
label, icon and colour for each are in `src/lib/eventMeta.ts`.

## Critical: sub-path deployment

The site is not served from `/`. Never `href="/"` — always `import.meta.env.BASE_URL`.

## Notes

- **Logo.** Versions listed in `src/lib/crests.ts`, PNGs in `public/crests/`
  (`-clean` = background removed). Header and favicon use the **last** entry, so
  adding a version is one line plus the PNG. Untouched scans are archived in
  `src/assets/crests/`.
- **One hydrated component only**: `Countdown.svelte`. Everything else is static
  HTML; stops expand with native `<details>`.
