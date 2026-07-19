// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://mistahuman.github.io/pulinc-trip',
  base: '/pulinc-trip/',
  output: 'static',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      noExternal: ['lucide-svelte', '@skeletonlabs/skeleton-svelte'],
    },
  },
});
