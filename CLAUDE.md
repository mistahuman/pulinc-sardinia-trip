# pulinc-sardinia-trip — Claude Code context

Static trip site, built on `astro-svelte-skeleton-starter`. Deployed to GitHub Pages
on every push to `main`.

## Commands

```bash
npm run dev
npm run check    # astro check — type errors only, NOT run by CI
npm run build    # astro build to ./dist — this is what deploy.yml runs
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

### Other collections

- `gallery` — one file per day, `YYYY-MM-DD.md`, listing `photos` (`src` + optional
  `alt`) that live in `public/photos/`. `/galleria` walks the whole trip and pads
  every day to three slots, so a missing file is not a hole: it is three empty
  frames. Adding photos never means touching the page.

  It deliberately does **not** reuse the itinerary's rail — it is an album, not a
  plan: prints in white polaroid frames, leaning a degree or two. The lean comes
  from `tilt()` in `src/lib/gallery.ts`, a fixed ring indexed by day and slot, not
  `Math.random()`: a random tilt is re-rolled on every build and the album would
  rearrange itself between deploys. The frame stays light in dark mode on purpose
  (`bg-surface-50` is a fixed light token, not a mode-aware pair) — a polaroid is a
  white object, not a themed surface.

- `team` — one file per member (`name`, optional `nickname` `role` `photo` `number`
  `position`), body is the bio. Photos in `public/team/`; without one the card shows
  a silhouette. We travel nine, so `/squadra` draws the roster as a formation on a
  pitch: `position` (`gk` `def` `mid` `att`) picks the row, `number` is the shirt and
  the roster order, and the formation string is counted from the rows, not written
  down anywhere. A member with no `position` is not dropped — they go to the bench
  line under the pitch. The pitch itself is a column of flex rows over absolutely
  positioned markings, so a tenth Pulinc needs no layout work.

  A marker on the pitch is the member's `photo` when there is one and the shirt
  number when there isn't, both at the same size inside the same ring, so a squad
  only half photographed still reads as one line of markers. The roster card
  repeats that roundel as a badge on the avatar — the 9 on the pitch and the 9 in
  the list are deliberately the same object. The roster is capped at the pitch's
  own `max-w-xl` so the page stays a single column.

Both ship with a commented example file that documents the format — keep it.

## Critical: sub-path deployment

The site is not served from `/`. Never `href="/"` — always `import.meta.env.BASE_URL`.

## Notes

- **Logo.** Versions listed in `src/lib/crests.ts`, PNGs in `public/crests/`
  (`-clean` = background removed). Header and favicon use the **last** entry, so
  adding a version is one line plus the PNG. Untouched scans are archived in
  `src/assets/crests/`.
- **One hydrated component only**: `Countdown.svelte`. Everything else is static
  HTML; stops expand with native `<details>`. The Spotify player is a plain
  `<iframe>`, not an island.
- **Playlist.** `PLAYLIST_URL` at the top of `src/pages/bacheca.astro` takes the
  share link exactly as Spotify copies it; `src/lib/spotify.ts` strips the `?si=`
  and any `/intl-xx/` and derives the embed URL. Empty or unrecognised falls back
  to the same dashed "da collegare" box the Maps section uses.
