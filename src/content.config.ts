import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

export const EVENT_TYPES = [
  'travel',
  'ferry',
  'stay',
  'food',
  'beach',
  'activity',
  'birthday',
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
    infoLink: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const CHALLENGE_STATUSES = ['open', 'won', 'lost'] as const;

const challenges = defineCollection({
  loader: glob({ base: './src/content/challenges', pattern: '**/*.md' }),
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

export const collections = { itinerary, challenges, breaking };
