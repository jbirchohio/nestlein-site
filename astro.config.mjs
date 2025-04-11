import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless'; // ✅ Vercel serverless adapter

export default defineConfig({
  output: 'server', // ✅ Required for API endpoints to work
  adapter: vercel(), // ✅ Use Vercel's serverless functions
  integrations: [tailwind(), react()],
  vite: {
    optimizeDeps: {
      include: ['lucide-static'],
    },
  },
});
