import { Umbrella, Waves, UtensilsCrossed, Martini, Binoculars, Compass } from 'lucide-svelte';
import type { SPOT_CATEGORIES, SPOT_ZONES } from '../content.config';

export type SpotCategory = (typeof SPOT_CATEGORIES)[number];
export type SpotZone = (typeof SPOT_ZONES)[number];

// Same reasoning as the itinerary's event families: the icon and the label
// already say which kind of spot it is, so colour is free to encode the one
// split you actually navigate by — am I going in the water, or am I sitting
// down. Two tints from the crest, straight off the Skeleton theme.
export type SpotFamily = 'mare' | 'tavola';

export const SPOT_FAMILY_ACCENT: Record<SpotFamily, string> = {
  mare: 'var(--color-primary-500)', // cobalto della fascia
  tavola: 'var(--color-secondary-600)', // corallo dello scudo
};

export interface SpotMeta {
  icon: typeof Umbrella;
  label: string;
  family: SpotFamily;
}

export const SPOT_META: Record<SpotCategory, SpotMeta> = {
  spiaggia: { icon: Umbrella, label: 'Spiaggia', family: 'mare' },
  caletta: { icon: Waves, label: 'Caletta', family: 'mare' },
  ristorante: { icon: UtensilsCrossed, label: 'Ristorante', family: 'tavola' },
  bar: { icon: Martini, label: 'Bar', family: 'tavola' },
  vista: { icon: Binoculars, label: 'Vista', family: 'mare' },
  attivita: { icon: Compass, label: 'Attività', family: 'mare' },
};

export function spotAccentFor(category: SpotCategory): string {
  return SPOT_FAMILY_ACCENT[SPOT_META[category].family];
}

export const ZONE_LABEL: Record<SpotZone, string> = {
  alghero: 'Alghero',
  cagliari: 'Cagliari',
};
