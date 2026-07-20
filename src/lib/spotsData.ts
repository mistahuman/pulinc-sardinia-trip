import { getCollection } from 'astro:content';
import type { Anchor, Coords, Spot } from '@lib/spots';

/**
 * Server-only half of the spots layer: reads the collections at build time and
 * hands plain objects to the map island. Kept apart from `spots.ts` because
 * that one is imported by client components, and `astro:content` can't cross
 * that boundary.
 */

export async function loadSpots(): Promise<Spot[]> {
  const entries = await getCollection('spots');
  return entries
    .map((entry) => ({ id: entry.id, ...entry.data }) as Spot)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The fixed points that bothered to have coordinates — spots read better
 *  against "where we sleep" than floating on their own. */
export async function loadAnchors(): Promise<Anchor[]> {
  const events = await getCollection('itinerary');
  return events
    .filter((event) => event.data.coords)
    .map((event) => ({
      id: event.id,
      title: event.data.title,
      coords: event.data.coords as Coords,
    }));
}
