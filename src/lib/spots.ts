import type { SpotCategory, SpotZone } from '@lib/spotMeta';

/**
 * Types and pure helpers only — the map island imports this module, so nothing
 * here may touch `astro:content`. Loading the collections lives next door in
 * `spotsData.ts`, which is server-only.
 */
export type Coords = [number, number];

/**
 * Where each base sits, and which days we're there. The map opens on the zone
 * we're actually in, so on a chill morning the page is already showing the
 * right half of the island without anyone touching a filter.
 *
 * `until` is exclusive: the 14th is the transfer day, and by the time anyone
 * opens this looking for a beach we're heading south.
 */
export const ZONE_BASES: Record<SpotZone, { coords: Coords; label: string; until?: string }> = {
  alghero: { coords: [40.559, 8.318], label: 'Alghero', until: '2026-08-14' },
  cagliari: { coords: [39.26, 9.22], label: 'Maracalagonis' },
};

/** The zone to open on, given a day. Before and after the trip, show both. */
export function zoneForDate(isoDate: string): SpotZone | 'tutte' {
  if (isoDate < '2026-08-11' || isoDate > '2026-08-21') return 'tutte';
  return isoDate < ZONE_BASES.alghero.until! ? 'alghero' : 'cagliari';
}

/** Great-circle distance in km. Ten lines beat a dependency. */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Below a km, metres read better than "0.4 km". */
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** The shape the map island works with — plain data, no content-collection
 *  wrapper, so it serialises cleanly across the island boundary. */
export interface Spot {
  id: string;
  name: string;
  category: SpotCategory;
  zone: SpotZone;
  coords: Coords;
  drive?: number;
  tags: string[];
  caveat?: string;
  notes?: string;
  mapsLink?: string;
}

/** A fixed point of the trip: where we sleep, where we're already booked. */
export interface Anchor {
  id: string;
  title: string;
  coords: Coords;
}
