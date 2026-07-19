<script lang="ts">
  import Countdown from './Countdown.svelte';

  interface Props {
    /** ISO date of the first day of the trip. */
    start: string;
    /** ISO date of the last day of the trip. */
    end: string;
  }

  const { start, end }: Props = $props();

  const startMs = new Date(`${start}T00:00:00`).getTime();
  const endMs = new Date(`${end}T00:00:00`).getTime();

  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });
</script>

{#if now < startMs}
<Countdown target={start} caption="" />
{:else if now < endMs}
<Countdown target={end} caption="Tin botà per" variant="fire" />
{:else}
  <p class="font-display text-6xl tracking-[0.04em] text-primary-700 dark:text-primary-300">
    Siamo ancora vivi?
  </p>
{/if}
