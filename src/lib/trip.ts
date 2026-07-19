import { getCollection, type CollectionEntry } from 'astro:content';
import { dateRange, dayParts, sortKey } from '@lib/eventMeta';

export const TRIP_START = '2026-08-10';
export const TRIP_END = '2026-08-22';

/** Currently unused: the home page dropped the route chips. Kept so they're a
 *  one-line change away if they come back. */
export const TRIP_ROUTE = ['Olbia', 'Alghero', 'Maracalagonis', 'Solanas', 'Golfo Aranci'];

export type TripEvent = CollectionEntry<'itinerary'>;

/** "10 — 22 Agosto 2026" — the trip's dates, written the same way everywhere. */
export const TRIP_RANGE = (() => {
  const from = dayParts(TRIP_START);
  const to = dayParts(TRIP_END);
  return `${Number(from.num)} — ${Number(to.num)} ${to.month} ${TRIP_END.slice(0, 4)}`;
})();

/** Anchor used to jump from the calendar straight to a day in the timeline. */
export function dayAnchor(isoDate: string): string {
  return `giorno-${isoDate}`;
}

/** Same idea, one step finer: the calendar links to the exact card. */
export function eventAnchor(id: string): string {
  return `evento-${id}`;
}

/**
 * The itinerary, sorted and bucketed by day. Every day of the trip gets a
 * bucket even when empty, so the plan's holes stay visible instead of
 * collapsing away — the itinerary is still being filled in.
 */
export async function loadItinerary() {
  const events = (await getCollection('itinerary')).sort((a, b) => {
    const byDate = a.data.date.localeCompare(b.data.date);
    if (byDate !== 0) return byDate;
    const byTime = sortKey(a.data.type, a.data.time).localeCompare(
      sortKey(b.data.type, b.data.time),
    );
    if (byTime !== 0) return byTime;
    return a.data.title.localeCompare(b.data.title);
  });

  const days = dateRange(TRIP_START, TRIP_END);
  const byDay = new Map<string, TripEvent[]>(days.map((day) => [day, []]));
  for (const event of events) {
    if (!byDay.has(event.data.date)) byDay.set(event.data.date, []);
    byDay.get(event.data.date)!.push(event);
  }

  return { events, days, byDay };
}
