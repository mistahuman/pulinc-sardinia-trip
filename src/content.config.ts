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

// One file per day, named YYYY-MM-DD.md. A day with no file is not a hole: the
// gallery walks the whole trip anyway and fills the row with placeholders, so
// adding photos is dropping files in, never editing the page.
const gallery = defineCollection({
  loader: glob({ base: './src/content/gallery', pattern: '**/*.md' }),
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    photos: z
      .array(
        z.object({
          // File under public/photos/ — the page builds the URL from BASE_URL.
          src: z.string(),
          alt: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const POSITIONS = ['gk', 'def', 'mid', 'att'] as const;

// We travel nine, which is a squad, so the roster is a squad sheet: a number, a
// slot on the pitch, and the body of the file as the bio.
const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    nickname: z.string().optional(),
    role: z.string().optional(),
    // File under public/team/. Without it the card shows a silhouette.
    photo: z.string().optional(),
    // Shirt number, and the roster order with it.
    number: z.number().int().positive().optional(),
    // Without one the member sits on the bench instead of on the pitch.
    position: z.enum(POSITIONS).optional(),
  }),
});

export const collections = { itinerary, challenges, breaking, gallery, team };
