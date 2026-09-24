import { getCollection } from 'astro:content';

export interface SnapshotPhoto {
  src: string;
  caption?: string;
  alt?: string;
}

export function photoUrl(base: string, src: string): string {
  return `${base}photos/${src}`;
}

/** All the photos, flattened across however many files hold them. */
export async function loadSnapshots(): Promise<SnapshotPhoto[]> {
  const entries = await getCollection('snapshots');
  return entries.flatMap((entry) => entry.data.photos);
}
