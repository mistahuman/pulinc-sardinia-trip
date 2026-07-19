<script lang="ts">
  interface Props {
    /** ISO date to count down to. */
    target: string;
    caption: string;
    /** 'fire' is the in-vacation look: warm gradient, coral → amber. */
    variant?: 'default' | 'fire';
  }

  const { target, caption, variant = 'default' }: Props = $props();

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

  // 'fire' stays a surface card like every other card on the site: the heat is
  // a veil laid over it — corallo salendo in seppia, the same two crest colours
  // and the same low dose the body glows use — not a solid fill.
  const cardClass =
    variant === 'fire'
      ? 'preset-filled-surface-100-900 bg-linear-to-t from-[color-mix(in_oklab,var(--color-secondary-500)_22%,transparent)] to-[color-mix(in_oklab,var(--color-tertiary-500)_12%,transparent)] border-[color-mix(in_oklab,var(--color-secondary-500)_50%,transparent)]'
      : 'preset-filled-surface-100-900 border-surface-300-700';

  const digitClass =
    variant === 'fire'
      ? 'text-secondary-800 dark:text-secondary-200'
      : 'text-surface-950 dark:text-surface-50';

  const captionClass =
    variant === 'fire' ? 'text-secondary-700 dark:text-secondary-300' : 'opacity-55';
</script>

<div>
  <p class={`mb-3 font-mono-trip text-xs uppercase tracking-[0.22em] ${captionClass}`}>
    {caption}
  </p>
  <div class="grid grid-cols-4 gap-2 sm:gap-4">
    {#each parts as part (part.label)}
      <div class={`card border px-1 py-4 sm:py-6 ${cardClass}`}>
        <span
          class={`block font-display text-[clamp(2.5rem,11vw,5rem)] leading-none tabular-nums ${digitClass}`}
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
</div>
