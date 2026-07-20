<script lang="ts">
  // Leaflet's own stylesheet, scoped to this route's bundle rather than added
  // to global.css: no other page pays for it.
  import 'leaflet/dist/leaflet.css';
  import { onMount } from 'svelte';
  import type { Map as LeafletMap, Marker, TileLayer } from 'leaflet';
  import type { Anchor, Coords, Spot } from '@lib/spots';
  import { spotAccentFor } from '@lib/spotMeta';
  import { pinHtml } from '@lib/spotPins';

  interface Props {
    spots: Spot[];
    anchors: Anchor[];
    selectedId: string | null;
    userPos: Coords | null;
    onSelect: (id: string) => void;
  }

  const { spots, anchors, selectedId, userPos, onSelect }: Props = $props();

  // Leaflet instances are deliberately kept out of `$state`: the deep proxy
  // Svelte 5 wraps state in confuses Leaflet's internal identity checks, and
  // these objects are mutated imperatively anyway.
  let container: HTMLDivElement;
  let L: typeof import('leaflet') | null = null;
  let map: LeafletMap | null = null;
  let tiles: TileLayer | null = null;
  // A plain lookup table, not state: nothing renders from it, the effects below
  // read it only to decide which Leaflet markers to add or drop. A SvelteMap
  // here would buy reactivity nobody subscribes to.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const markers = new globalThis.Map<string, Marker>();
  let userMarker: Marker | null = null;
  let ready = $state(false);

  // Desaturated basemaps: the pins carry the colour, so the map underneath
  // shouldn't compete with them. Both variants come from the same provider so
  // toggling the theme doesn't change the map's geometry, only its palette.
  const TILES = {
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
  };
  const ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const isDark = () => document.documentElement.getAttribute('data-mode') === 'dark';

  onMount(() => {
    let observer: MutationObserver | undefined;
    let cancelled = false;

    // Loaded on the client only: Leaflet touches `window` at import time, and
    // this component is server-rendered so the list exists without JS.
    (async () => {
      const mod = await import('leaflet');
      if (cancelled) return;
      L = mod.default ?? mod;

      map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
        // Two fingers to pan the map, so scrolling the page past it on a phone
        // doesn't get swallowed by the map.
        dragging: !L.Browser.mobile,
        tap: false,
      }).setView([40.1, 8.9], 8);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      tiles = L.tileLayer(isDark() ? TILES.dark : TILES.light, {
        attribution: ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      // The lightswitch flips an attribute on <html>; follow it.
      observer = new MutationObserver(() => {
        tiles?.setUrl(isDark() ? TILES.dark : TILES.light);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-mode'],
      });

      ready = true;
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      map = null;
    };
  });

  /** Rebuild the pins whenever the filtered set changes. */
  $effect(() => {
    if (!ready || !L || !map) return;
    const lib = L;
    const instance = map;

    const wanted = new Set(spots.map((spot) => spot.id));
    for (const [id, marker] of markers) {
      if (!wanted.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }

    for (const spot of spots) {
      const icon = lib.divIcon({
        html: pinHtml(spot.category, spotAccentFor(spot.category), spot.id === selectedId),
        className: 'spot-pin-wrap',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const existing = markers.get(spot.id);
      if (existing) {
        existing.setIcon(icon);
        continue;
      }
      const marker = lib
        .marker(spot.coords, { icon, title: spot.name })
        .addTo(instance)
        .on('click', () => onSelect(spot.id));
      markers.set(spot.id, marker);
    }

    // Anchors are drawn once and never filtered: they're the fixed points.
    for (const anchor of anchors) {
      if (markers.has(`anchor:${anchor.id}`)) continue;
      const marker = lib
        .marker(anchor.coords, {
          icon: lib.divIcon({
            html: `<span class="spot-anchor" title="${anchor.title}"></span>`,
            className: 'spot-pin-wrap',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
          title: anchor.title,
          interactive: false,
        })
        .addTo(instance);
      markers.set(`anchor:${anchor.id}`, marker);
    }
  });

  /** Frame the current selection: the whole set, or the one spot picked. */
  $effect(() => {
    if (!ready || !L || !map) return;
    if (selectedId) {
      const spot = spots.find((candidate) => candidate.id === selectedId);
      if (spot) map.flyTo(spot.coords, Math.max(map.getZoom(), 13), { duration: 0.6 });
      return;
    }
    const points = spots.map((spot) => spot.coords);
    if (userPos) points.push(userPos);
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 13, animate: false });
    }
  });

  /** Where we are, when the browser will say. */
  $effect(() => {
    if (!ready || !L || !map) return;
    if (!userPos) {
      userMarker?.remove();
      userMarker = null;
      return;
    }
    if (userMarker) {
      userMarker.setLatLng(userPos);
      return;
    }
    userMarker = L.marker(userPos, {
      icon: L.divIcon({
        html: '<span class="spot-me"></span>',
        className: 'spot-pin-wrap',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map);
  });
</script>

<div
  bind:this={container}
  class="h-full w-full bg-surface-200-800"
  role="application"
  aria-label="Mappa degli spot"
></div>

{#if !ready}
  <div class="pointer-events-none absolute inset-0 grid place-items-center">
    <span class="font-mono-trip text-[0.68rem] uppercase tracking-[0.16em] opacity-50">
      Carico la mappa…
    </span>
  </div>
{/if}

<style>
  /* Leaflet builds these nodes itself, outside Svelte's scoping — hence
     :global. They mirror the card styling: the same --accent, the same round
     thick stroke as the crest. */
  :global(.spot-pin-wrap) {
    background: none;
    border: none;
  }

  :global(.spot-pin) {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    color: var(--accent);
    background: var(--color-surface-50);
    border: 2px solid var(--accent);
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.3);
    transition:
      transform 0.15s ease,
      background-color 0.15s ease;
  }

  :global([data-mode='dark'] .spot-pin) {
    background: var(--color-surface-900);
  }

  :global(.spot-pin svg) {
    width: 18px;
    height: 18px;
  }

  /* The selected pin inverts instead of just growing: on a bright beach at
     arm's length, a size change alone is easy to miss. */
  :global(.spot-pin--on) {
    transform: scale(1.2);
    background: var(--accent);
    color: var(--color-surface-50);
    z-index: 500;
  }

  /* Fixed points of the trip: present, but never louder than a spot. */
  :global(.spot-anchor) {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: var(--color-surface-950);
    border: 2px solid var(--color-surface-50);
    opacity: 0.55;
    transform: rotate(45deg);
  }

  :global([data-mode='dark'] .spot-anchor) {
    background: var(--color-surface-50);
    border-color: var(--color-surface-950);
  }

  :global(.spot-me) {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: var(--color-tertiary-500);
    border: 3px solid var(--color-surface-50);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-tertiary-500) 35%, transparent);
  }

  /* Leaflet's chrome ships with its own light styling; align it to the theme. */
  :global(.leaflet-container) {
    font-family: inherit;
    background: var(--color-surface-200);
  }

  :global([data-mode='dark'] .leaflet-container) {
    background: var(--color-surface-800);
  }

  :global(.leaflet-control-attribution) {
    font-size: 0.6rem;
    background: color-mix(in oklab, var(--color-surface-50) 80%, transparent) !important;
  }

  :global([data-mode='dark'] .leaflet-control-attribution) {
    background: color-mix(in oklab, var(--color-surface-950) 80%, transparent) !important;
    color: var(--color-surface-300);
  }

  :global([data-mode='dark'] .leaflet-control-attribution a) {
    color: var(--color-primary-300);
  }
</style>
