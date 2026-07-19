/**
 * The logo, version by version, oldest first.
 *
 * `slug` names a PNG in `public/crests/`: the hand-drawn scan with the sheet
 * around the shield made transparent — hence the `-clean` suffix, which tells
 * it apart from the untouched scan archived in `src/assets/crests/`.
 */
export interface Crest {
  slug: string;
  version: string;
}

export const CRESTS: Crest[] = [
  { slug: 'old-pulinc-logo-clean', version: '1.0.0' },
  { slug: 'new-pulinc-logo-clean', version: '2.0.0' },
];

/** The one the site wears in the header and as favicon: the latest. */
export const CURRENT_CREST = CRESTS[CRESTS.length - 1]!;

export function crestUrl(base: string, slug: string): string {
  return `${base}crests/${slug}.png`;
}

/** Intrinsic size of the generated PNGs — they're all normalised to 440 tall. */
export const CREST_SIZE = { width: 357, height: 440 };
