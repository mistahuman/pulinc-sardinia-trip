import { Ship, Car, BedDouble, UtensilsCrossed, Umbrella, Compass, Cake } from 'lucide-svelte';
import type { EVENT_TYPES } from '../content.config';

export type EventType = (typeof EVENT_TYPES)[number];

// Each type carries its own colour, except travel and ferry: those are the same
// act — you are on your way — so a second hue there would split what the eye
// should read as one thing. Six accents, not seven.
// The values live in global.css as --accent-* tokens: each needs a different
// shade per mode to stay legible, which a value pinned here could not express.
export type EventAccent = 'transit' | 'stay' | 'food' | 'beach' | 'activity' | 'birthday';

export interface EventMeta {
  icon: typeof Ship;
  label: string;
  accent: EventAccent;
}

// Keys are English, labels are Italian: the key is code, the label is content.
export const EVENT_META: Record<EventType, EventMeta> = {
  travel: { icon: Car, label: 'Viaggio', accent: 'transit' },
  ferry: { icon: Ship, label: 'Traghetto', accent: 'transit' },
  stay: { icon: BedDouble, label: 'Alloggio', accent: 'stay' },
  food: { icon: UtensilsCrossed, label: 'Ristorante', accent: 'food' },
  beach: { icon: Umbrella, label: 'Spiaggia', accent: 'beach' },
  activity: { icon: Compass, label: 'Attività', accent: 'activity' },
  birthday: { icon: Cake, label: 'Compleanno', accent: 'birthday' },
};

export function accentFor(type: EventType): string {
  return `var(--accent-${EVENT_META[type].accent})`;
}

// Events without an explicit time still need to fall in a sensible spot in the
// day: you leave in the morning, eat in the evening, check in at the end.
const DEFAULT_SLOT: Record<EventType, string> = {
  // Not an appointment but a fact about the whole day, so it opens it.
  birthday: '00:00',
  travel: '09:00',
  ferry: '10:00',
  beach: '11:00',
  activity: '15:00',
  food: '20:00',
  stay: '21:00',
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
