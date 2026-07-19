import { Ship, Car, BedDouble, UtensilsCrossed, Umbrella, Compass, Cake } from 'lucide-svelte';
import type { EVENT_TYPES } from '../content.config';

export type EventType = (typeof EVENT_TYPES)[number];

// Each type belongs to a family, and the family is what carries the colour.
// Two families, not one per type: the icon and the label already say what kind
// of stop it is, so a third encoding just adds noise. What colour is left to
// say is the one thing you scan a trip for — am I moving, or am I staying put.
// Both tints come from the crest; colours come from the Skeleton theme so light
// and dark mode stay in sync for free.
export type EventFamily = 'movimento' | 'sosta';

export const FAMILY_ACCENT: Record<EventFamily, string> = {
  movimento: 'var(--color-primary-500)', // cobalto della fascia
  sosta: 'var(--color-tertiary-600)', // seppia dell'inchiostro
};

export interface EventMeta {
  icon: typeof Ship;
  label: string;
  family: EventFamily;
}

export const EVENT_META: Record<EventType, EventMeta> = {
  viaggio: { icon: Car, label: 'Viaggio', family: 'movimento' },
  traghetto: { icon: Ship, label: 'Traghetto', family: 'movimento' },
  alloggio: { icon: BedDouble, label: 'Alloggio', family: 'sosta' },
  ristorante: { icon: UtensilsCrossed, label: 'Ristorante', family: 'sosta' },
  spiaggia: { icon: Umbrella, label: 'Spiaggia', family: 'sosta' },
  attivita: { icon: Compass, label: 'Attività', family: 'sosta' },
  compleanno: { icon: Cake, label: 'Compleanno', family: 'sosta' },
};

export function accentFor(type: EventType): string {
  return FAMILY_ACCENT[EVENT_META[type].family];
}

// Events without an explicit time still need to fall in a sensible spot in the
// day: you leave in the morning, eat in the evening, check in at the end.
const DEFAULT_SLOT: Record<EventType, string> = {
  // Not an appointment but a fact about the whole day, so it opens it.
  compleanno: '00:00',
  viaggio: '09:00',
  traghetto: '10:00',
  spiaggia: '11:00',
  attivita: '15:00',
  ristorante: '20:00',
  alloggio: '21:00',
};

export function sortKey(type: EventType, time?: string): string {
  return time ? time.split('-')[0]!.trim() : DEFAULT_SLOT[type];
}

export function startTime(time?: string): string | null {
  return time ? time.split('-')[0]!.trim() : null;
}

const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const GIORNI_ABBR = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

function parse(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export function dayParts(isoDate: string) {
  const date = parse(isoDate);
  return {
    num: String(date.getUTCDate()).padStart(2, '0'),
    weekday: GIORNI_ABBR[date.getUTCDay()]!,
    weekdayFull: GIORNI[date.getUTCDay()]!,
    month: MESI[date.getUTCMonth()]!,
  };
}

export const WEEKDAYS_MON_FIRST = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function monthName(month: number): string {
  return MESI[month - 1]!;
}

/**
 * A month laid out as a Monday-first grid: leading and trailing blanks so the
 * columns line up with the weekday header.
 */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Sunday=0 → Monday-first
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (string | null)[] = Array(lead).fill(null);
  for (let day = 1; day <= total; day++) {
    cells.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Every date between two ISO days, inclusive — so empty days still show up. */
export function dateRange(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  const cursor = parse(startIso);
  const end = parse(endIso);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}
