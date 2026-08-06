import { getCollection } from 'astro:content';
import { dateRange } from '@lib/eventMeta';
import { TRIP_END, TRIP_START } from '@lib/trip';

/** Three frames a day: enough to tell the day, few enough to stay a timeline. */
export const PHOTOS_PER_DAY = 3;

export interface GalleryPhoto {
  src: string;
  caption?: string;
  alt?: string;
}

/** A slot is a photo, or `null` for a frame nobody has filled yet. */
export type GallerySlot = GalleryPhoto | null;

export interface GalleryDay {
  date: string;
  slots: GallerySlot[];
  /** How many of the slots are real photos — drives the day's counter. */
  filled: number;
}

export function photoUrl(base: string, src: string): string {
  return `${base}photos/${src}`;
}

/**
 * How far each polaroid leans. Picked from a fixed ring by position rather than
 * at random: a random tilt would be re-rolled on every build, so the album would
 * quietly rearrange itself between deploys. Kept under two degrees — enough to
 * read as "dropped on a table", not enough to make the rows look broken.
 */
const TILTS = ['-1.6deg', '1.2deg', '-0.7deg', '1.8deg', '-1.1deg', '0.6deg'];

export function tilt(dayIndex: number, slotIndex: number): string {
  return TILTS[(dayIndex * 2 + slotIndex) % TILTS.length]!;
}

/**
 * The gallery, day by day, for the whole trip. A day always yields at least
 * PHOTOS_PER_DAY slots so the rows stay the same shape while the trip is still
 * ahead of us; a day that ends up with more photos than that just grows.
 */
export async function loadGallery(): Promise<GalleryDay[]> {
  const entries = await getCollection('gallery');
  const byDate = new Map(entries.map((entry) => [entry.data.date, entry.data.photos]));

  return dateRange(TRIP_START, TRIP_END).map((date) => {
    const photos = byDate.get(date) ?? [];
    const size = Math.max(PHOTOS_PER_DAY, photos.length);
    const slots: GallerySlot[] = Array.from({ length: size }, (_, i) => photos[i] ?? null);
    return { date, slots, filled: photos.length };
  });
}
