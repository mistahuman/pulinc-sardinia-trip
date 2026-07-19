import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

export const EVENT_TYPES = [
  'partenza',
  'traghetto',
  'trasferimento',
  'hotel',
  'villa',
  'ristorante',
  'attivita',
  'ritorno',
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
  }),
});

export const collections = { itinerary };
