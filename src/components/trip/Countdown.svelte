<script lang="ts">
  interface Props {
    /** ISO date of the first day of the trip. */
    target: string;
  }

  const { target }: Props = $props();

  const targetMs = new Date(`${target}T00:00:00`).getTime();

  // Rendered on the server too, so start from a value instead of null to avoid
  // a layout jump on hydration.
  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });

  const diff = $derived(Math.max(0, targetMs - now));
  const parts = $derived([
    { label: 'giorni', value: Math.floor(diff / 86_400_000) },
    { label: 'ore', value: Math.floor(diff / 3_600_000) % 24 },
    { label: 'min', value: Math.floor(diff / 60_000) % 60 },
    { label: 'sec', value: Math.floor(diff / 1000) % 60 },
  ]);
</script>

{#if diff === 0}
  <p class="font-display text-6xl tracking-[0.04em] text-primary-700 dark:text-primary-300">
    Si parte
  </p>
{:else}
  <div class="grid grid-cols-4 gap-2 sm:gap-4">
    {#each parts as part (part.label)}
      <div
        class="card preset-filled-surface-100-900 border border-surface-300-700 px-1 py-4 sm:py-6"
      >
        <span
          class="block font-display text-[clamp(2.5rem,11vw,5rem)] leading-none tabular-nums text-surface-950 dark:text-surface-50"
        >
          {String(part.value).padStart(2, '0')}
        </span>
        <span
          class="mt-1.5 block font-mono-trip text-[0.58rem] uppercase tracking-[0.2em] opacity-55 sm:text-[0.68rem]"
        >
          {part.label}
        </span>
      </div>
    {/each}
  </div>
{/if}
