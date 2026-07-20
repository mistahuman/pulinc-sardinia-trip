<script lang="ts">
  import { LocateFixed, X } from 'lucide-svelte';
  import SpotMap from './SpotMap.svelte';
  import SpotCard from './SpotCard.svelte';
  import { SPOT_META, ZONE_LABEL, type SpotCategory, type SpotZone } from '@lib/spotMeta';
  import { distanceKm, type Anchor, type Coords, type Spot } from '@lib/spots';

  interface Props {
    spots: Spot[];
    anchors: Anchor[];
    /** Zone the page opens on, worked out from today's date at build time. */
    initialZone: SpotZone | 'tutte';
    categories: SpotCategory[];
    zones: SpotZone[];
  }

  const { spots, anchors, initialZone, categories, zones }: Props = $props();

  let zone = $state<SpotZone | 'tutte'>(initialZone);
  let active = $state<Set<SpotCategory>>(new Set());
  let selectedId = $state<string | null>(null);
  let userPos = $state<Coords | null>(null);
  let geo = $state<'idle' | 'asking' | 'denied'>('idle');

  const byZone = $derived(zone === 'tutte' ? spots : spots.filter((spot) => spot.zone === zone));

  // An empty category set means "everything", not "nothing" — no chip selected
  // is the resting state of the page, and it should show the full list.
  const visible = $derived.by(() => {
    const filtered =
      active.size === 0 ? byZone : byZone.filter((spot) => active.has(spot.category));
    if (!userPos) return filtered;
    const here = userPos;
    return [...filtered].sort(
      (a, b) => distanceKm(here, a.coords) - distanceKm(here, b.coords),
    );
  });

  // Only offer a chip if something in this zone actually uses it: an empty
  // filter that yields nothing is a dead end you can tap.
  const availableCategories = $derived(
    categories.filter((category) => byZone.some((spot) => spot.category === category)),
  );

  const anchorsInZone = $derived(
    zone === 'tutte'
      ? anchors
      : anchors.filter((anchor) =>
          byZone.some((spot) => distanceKm(spot.coords, anchor.coords) < 60),
        ),
  );

  function toggle(category: SpotCategory) {
    const next = new Set(active);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    active = next;
  }

  function select(id: string) {
    selectedId = selectedId === id ? null : id;
    if (!selectedId) return;
    // Coming from a pin, the matching card is usually off-screen.
    requestAnimationFrame(() => {
      document
        .getElementById(`spot-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function locate() {
    if (userPos) {
      userPos = null;
      geo = 'idle';
      return;
    }
    if (!navigator.geolocation) {
      geo = 'denied';
      return;
    }
    geo = 'asking';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userPos = [position.coords.latitude, position.coords.longitude];
        geo = 'idle';
      },
      () => {
        geo = 'denied';
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  const distanceFor = (spot: Spot) => (userPos ? distanceKm(userPos, spot.coords) : null);
</script>

<div class="flex flex-col gap-4 xl:h-[calc(100vh-70px-3rem)] xl:flex-row-reverse">
  <!-- Map: sticky under the header on a phone, a full-height column on desktop -->
  <div
    class="sticky top-[70px] z-30 -mx-4 h-[42vh] overflow-hidden border-y border-surface-300-700 bg-surface-100-900 xl:static xl:mx-0 xl:h-auto xl:w-[55%] xl:rounded-container xl:border"
  >
    <div class="relative h-full w-full">
      <SpotMap spots={visible} anchors={anchorsInZone} {selectedId} {userPos} onSelect={select} />
    </div>
  </div>

  <div class="flex min-w-0 flex-col gap-3 xl:w-[45%]">
    <!-- Filters -->
    <div class="space-y-2.5">
      <div class="flex flex-wrap items-center gap-2">
        {#each ['tutte', ...zones] as const as value (value)}
          <button
            type="button"
            class="btn btn-sm font-mono-trip text-[0.68rem] uppercase tracking-[0.12em]"
            class:preset-filled-primary-500={zone === value}
            class:preset-outlined-surface-500={zone !== value}
            onclick={() => {
              zone = value;
              selectedId = null;
            }}
          >
            {value === 'tutte' ? 'Tutte' : ZONE_LABEL[value]}
          </button>
        {/each}

        <button
          type="button"
          class="btn btn-sm ml-auto font-mono-trip text-[0.68rem] uppercase tracking-[0.12em]"
          class:preset-filled-secondary-500={userPos}
          class:preset-outlined-surface-500={!userPos}
          disabled={geo === 'asking'}
          onclick={locate}
        >
          <LocateFixed size={14} />
          <span>{geo === 'asking' ? 'Cerco…' : userPos ? 'Vicino a me' : 'Dove sono'}</span>
        </button>
      </div>

      <div class="flex flex-wrap gap-1.5">
        {#each availableCategories as category (category)}
          {@const meta = SPOT_META[category]}
          <button
            type="button"
            class="btn btn-sm gap-1.5 font-mono-trip text-[0.68rem] uppercase tracking-[0.1em]"
            class:preset-filled-surface-950-50={active.has(category)}
            class:preset-outlined-surface-500={!active.has(category)}
            aria-pressed={active.has(category)}
            onclick={() => toggle(category)}
          >
            <meta.icon size={14} />
            <span>{meta.label}</span>
          </button>
        {/each}
        {#if active.size > 0}
          <button
            type="button"
            class="btn btn-sm preset-outlined-surface-500 font-mono-trip text-[0.68rem] uppercase tracking-[0.1em]"
            onclick={() => (active = new Set())}
          >
            <X size={14} />
          </button>
        {/if}
      </div>

      {#if geo === 'denied'}
        <p class="m-0 font-mono-trip text-[0.68rem] opacity-60">
          Posizione non disponibile — restano i minuti d'auto dalla base.
        </p>
      {/if}
    </div>

    <!-- List -->
    <div class="flex items-baseline gap-3">
      <span class="font-mono-trip text-[0.68rem] uppercase tracking-[0.2em] opacity-55">
        {visible.length}
        {visible.length === 1 ? 'posto' : 'posti'}
        {userPos ? '· dal più vicino' : ''}
      </span>
      <span class="h-px flex-1 bg-surface-500/25"></span>
    </div>

    <ul class="m-0 list-none space-y-2 p-0 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
      {#each visible as spot (spot.id)}
        <li>
          <SpotCard
            {spot}
            distance={distanceFor(spot)}
            selected={selectedId === spot.id}
            onSelect={select}
          />
        </li>
      {:else}
        <li class="rounded-base border border-dashed border-surface-500/30 px-3.5 py-6 text-center font-mono-trip text-xs opacity-60">
          Niente con questi filtri
        </li>
      {/each}
    </ul>
  </div>
</div>
