import { getCollection } from 'astro:content';
import type { GalleryPhoto } from '@lib/gallery';

/** All the undated photos, flattened across however many files hold them. */
export async function loadSnapshots(): Promise<GalleryPhoto[]> {
  const entries = await getCollection('snapshots');
  return entries.flatMap((entry) => entry.data.photos);
}
