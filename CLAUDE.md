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
  `caption` and `alt`) that live in `public/photos/`. `caption` is the line written
  on the polaroid's white border; `alt` is the description for anyone who can't see
  the photo and falls back to the caption. They are kept apart on purpose — one is
  visible text, the other is not, and a single field cannot be both well. `/galleria` walks the whole trip and pads
  every day to three slots, so a missing file is not a hole: it is three empty
  frames. Adding photos never means touching the page.

  It deliberately does **not** reuse the itinerary's rail — it is an album, not a
  plan: prints in white polaroid frames, leaning a degree or two. The lean comes
  from `tilt()` in `src/lib/gallery.ts`, a fixed ring indexed by day and slot, not
  `Math.random()`: a random tilt is re-rolled on every build and the album would
  rearrange itself between deploys.

  The frame itself is `src/components/trip/Polaroid.astro`. No `src` means an empty
  frame, so one component covers both a print and a slot nobody has filled. It
  stays light in dark mode on purpose (`bg-surface-50` is a fixed light token, not
  a mode-aware pair) — a polaroid is a white object, not a themed surface.

- `team` — one file per member (`name`, optional `nickname` `photo` `number`
  `position`). We travel nine, so the **Squadra** section of the bacheca draws them
  as a formation on a pitch, `src/components/trip/Pitch.astro`: `position`
  (`gk` `def` `mid` `att`) picks the row, `number` is the shirt, and the formation
  string in the section header is counted from the rows rather than written down
  anywhere. A member with no `position` is not dropped — they are named on a bench
  line under the pitch. The pitch is a column of flex rows over absolutely
  positioned markings, so a tenth Pulinc needs no layout work.

  A marker is the member's `photo` when there is one and the shirt number when
  there isn't, both at the same size inside the same ring, so a squad only half
  photographed still reads as one line of markers. Photos go in `public/team/`.

  There was a `/squadra` page with a roster card per member; it was dropped once
  every `nickname`, `role` and bio had been emptied, which left the cards showing
  a name and a number the pitch already showed better. **`role` and the markdown
  body are therefore rendered nowhere right now** — the schema still accepts them,
  but nothing reads them. Fill them in and they stay invisible until something
  renders them again.

`gallery` and `team` both ship with a commented example file that documents the
format — keep it.

## Images

`public/photos/` (gallery) and `public/team/` (faces) are served as-is — there is no
Astro image pipeline here, so nothing resizes or re-encodes on build and whatever is
committed is what visitors download. A phone shot is 3-5 MB and 4000px wide against
a gallery that draws it at ~280px.

So: drop the photos in, then run

```bash
npm run photos              # public/photos/
npm run photos -- public/team
```

`scripts/photos.sh` shrinks the long side to 1200px, re-encodes as JPEG q82 and
strips the metadata. It is safe to re-run — a file that is already a small enough
`.jpg` is skipped rather than compressed a second time. It renames to `.jpg` and
prints what it renamed, because `src` in the gallery files has to follow.

Requires ImageMagick (`convert`). It reads iPhone HEIC. **`-auto-orient` runs before
`-strip` and the order is load-bearing**: phones leave the pixels sideways and record
the rotation in EXIF, so stripping first would land every portrait photo on its side.

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
