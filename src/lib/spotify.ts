/**
 * Turns a Spotify share link into the URL its embeddable player lives at.
 *
 * The link copied from the app carries a `?si=` tracking param and sometimes an
 * `/intl-it/` segment; both are dropped here so the constant in the page can be
 * pasted in exactly as Spotify hands it over. Anything that is not a playlist,
 * album or track link returns null, and the page falls back to its empty state
 * rather than embedding a 404.
 */
export function spotifyEmbedUrl(shareUrl: string): string | null {
  const match = shareUrl.match(
    /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track)\/([A-Za-z0-9]+)/,
  );
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`;
}
