import { getCollection, type CollectionEntry } from 'astro:content';
import type { POSITIONS } from '../content.config';

export type TeamMember = CollectionEntry<'team'>;
export type Position = (typeof POSITIONS)[number];

export const POSITION_LABEL: Record<Position, string> = {
  gk: 'Portiere',
  def: 'Difesa',
  mid: 'Centrocampo',
  att: 'Attacco',
};

/** Drawn attack-first: the pitch is laid out the way you read a formation. */
export const PITCH_ROWS: Position[] = ['att', 'mid', 'def', 'gk'];

export interface PitchRow {
  position: Position;
  players: TeamMember[];
}

/**
 * The squad: numbered order, split into the rows of the pitch. Anyone without a
 * `position` is not dropped, they sit on the bench under the pitch — the module
 * should never silently lose a person because a field is missing.
 */
export async function loadTeam() {
  const members = (await getCollection('team')).sort((a, b) => {
    const byNumber = (a.data.number ?? Infinity) - (b.data.number ?? Infinity);
    if (byNumber !== 0) return byNumber;
    return a.data.name.localeCompare(b.data.name);
  });

  const rows: PitchRow[] = PITCH_ROWS.map((position) => ({
    position,
    players: members.filter((member) => member.data.position === position),
  })).filter((row) => row.players.length > 0);

  const bench = members.filter((member) => !member.data.position);

  /** "1-3-3-2", read from the back — the way a formation is always said. */
  const formation = [...rows]
    .reverse()
    .map((row) => row.players.length)
    .join('-');

  return { members, rows, bench, formation };
}
