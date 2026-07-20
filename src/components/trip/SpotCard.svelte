<script lang="ts">
  import { ChevronRight, MapPin, Car, TriangleAlert } from 'lucide-svelte';
  import { SPOT_META, spotAccentFor } from '@lib/spotMeta';
  import { formatDistance, type Spot } from '@lib/spots';

  interface Props {
    spot: Spot;
    /** Straight-line km from the user, when they've shared their position. */
    distance: number | null;
    selected: boolean;
    onSelect: (id: string) => void;
  }

  const { spot, distance, selected, onSelect }: Props = $props();

  const meta = $derived(SPOT_META[spot.category]);
  const accent = $derived(spotAccentFor(spot.category));
</script>

<!-- Deliberately a <details>, like EventCard: the closed state is a scannable
     row, and the details are one tap away without leaving the list. -->
<details
  id={`spot-${spot.id}`}
  open={selected}
  style={`--accent: ${accent}`}
  class="group card preset-filled-surface-100-900 scroll-mt-4 overflow-hidden border transition-colors"
  class:border-surface-300-700={!selected}
  class:accent-border={selected}
>
  <summary
    class="flex cursor-pointer list-none items-start gap-3 p-3.5 [&::-webkit-details-marker]:hidden"
    onclick={() => onSelect(spot.id)}
  >
    <span class="accent-tint accent-text grid size-10 shrink-0 place-items-center rounded-base">
      <meta.icon size={20} />
    </span>

    <span class="flex min-w-0 flex-1 flex-col gap-0.5">
      <span
        class="accent-text font-mono-trip text-[0.62rem] uppercase leading-none tracking-[0.16em]"
      >
        {meta.label}
      </span>
      <span class="text-pretty font-semibold leading-snug">{spot.name}</span>
    </span>

    <span class="flex shrink-0 items-center gap-2 pt-1">
      {#if distance !== null}
        <span class="font-mono-trip text-sm tabular-nums text-surface-700-300">
          {formatDistance(distance)}
        </span>
      {:else if spot.drive}
        <span class="flex items-center gap-1 font-mono-trip text-sm tabular-nums text-surface-600-400">
          <Car size={14} />{spot.drive}′
        </span>
      {/if}
      <ChevronRight size={18} class="text-surface-500 transition-transform group-open:rotate-90" />
    </span>
  </summary>

  <div class="space-y-2.5 border-t border-dashed border-surface-300-700 px-3.5 py-3">
    {#if spot.caveat}
      <!-- Louder than the notes on purpose: this is the thing that ruins the
           afternoon if you read it once you're already parked. -->
      <p class="m-0 flex items-start gap-2 rounded-base bg-warning-500/12 px-2.5 py-2 text-sm">
        <TriangleAlert size={15} class="mt-0.5 shrink-0 text-warning-700 dark:text-warning-300" />
        <span>{spot.caveat}</span>
      </p>
    {/if}

    {#if spot.notes}
      <p class="m-0 text-sm opacity-90">{spot.notes}</p>
    {/if}

    {#if spot.tags.length > 0}
      <ul class="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {#each spot.tags as tag (tag)}
          <li
            class="rounded-base border border-surface-500/25 px-1.5 py-0.5 font-mono-trip text-[0.62rem] tracking-[0.08em] opacity-70"
          >
            {tag}
          </li>
        {/each}
      </ul>
    {/if}

    <div class="flex flex-wrap items-center gap-2 pt-1">
      {#if spot.drive}
        <span class="font-mono-trip text-[0.68rem] uppercase tracking-[0.1em] opacity-60">
          {spot.drive} min dalla base
        </span>
      {/if}
      <a
        class="btn btn-sm preset-outlined-surface-500 ml-auto font-mono-trip text-[0.68rem] uppercase tracking-[0.1em]"
        href={spot.mapsLink ?? `https://www.google.com/maps/dir/?api=1&destination=${spot.coords[0]},${spot.coords[1]}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MapPin size={14} />
        <span>Portami qui</span>
      </a>
    </div>
  </div>
</details>
