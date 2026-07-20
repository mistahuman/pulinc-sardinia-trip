import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { file, glob } from 'astro/loaders';

/** [lat, lng]. Bounded to Sardinia so a swapped pair fails the build instead of
 *  dropping a pin in the Indian Ocean — the two numbers look alike otherwise. */
const coords = z.tuple([z.number().min(38.8).max(41.4), z.number().min(8).max(9.9)]);

export const EVENT_TYPES = [
  'viaggio',
  'traghetto',
  'alloggio',
  'ristorante',
  'spiaggia',
  'attivita',
  'compleanno',
] as const;

const itinerary = defineCollection({
  loader: glob({ base: './src/content/itinerary', pattern: '**/*.md' }),
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    type: z.enum(EVENT_TYPES),
    title: z.string(),
    shortTitle: z.string().optional(),
    time: z.string().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    mapsLink: z.string().optional(),
    bookingLink: z.string().optional(),
    notes: z.string().optional(),
    /** Optional: puts the fixed points of the trip (hotel, villa, the booked
     *  dinner) on the map page as a second layer, so spots can be read against
     *  "where we sleep" instead of floating on their own. */
    coords: coords.optional(),
  }),
});

export const CHALLENGE_STATUSES = ['open', 'won', 'lost'] as const;

const sfide = defineCollection({
  loader: glob({ base: './src/content/sfide', pattern: '**/*.md' }),
  schema: z.object({
    text: z.string(),
    status: z.enum(CHALLENGE_STATUSES).default('open'),
  }),
});

const breaking = defineCollection({
  loader: glob({ base: './src/content/breaking', pattern: '**/*.md' }),
  schema: z.object({
    text: z.string(),
  }),
});

export const SPOT_CATEGORIES = [
  'spiaggia',
  'caletta',
  'ristorante',
  'bar',
  'vista',
  'attivita',
] as const;

/** The two bases of the trip. Everything worth driving to belongs to one of
 *  them — a third value would mean a spot nobody is ever near. */
export const SPOT_ZONES = ['alghero', 'cagliari'] as const;

/**
 * Hot spots to pick from on the fly during the chill days. One flat YAML file
 * rather than a file per spot: they get filled in bulk, and a single flat list
 * is the only thing that stays editable from a phone keyboard.
 */
const spots = defineCollection({
  loader: file('./src/data/spots.yaml'),
  schema: z.object({
    name: z.string(),
    category: z.enum(SPOT_CATEGORIES),
    zone: z.enum(SPOT_ZONES),
    coords,
    /** Minutes by car from that zone's base. The field that decides whether a
     *  spot is a whole day out or something you can still do after lunch. */
    drive: z.number().int().positive().optional(),
    tags: z.array(z.string()).default([]),
    /** The thing that ruins the trip if you find it out on arrival: paid
     *  parking, capped access, closed on Mondays. Rendered apart from `notes`. */
    caveat: z.string().optional(),
    notes: z.string().optional(),
    mapsLink: z.string().optional(),
  }),
});

export const collections = { itinerary, sfide, breaking, spots };
