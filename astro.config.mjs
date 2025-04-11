import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel({
    runtime: 'nodejs18.x' // ✅ Still valid
  }),
  output: 'server',
  integrations: [tailwind(), react()],
  vite: {
    optimizeDeps: {
      include: ['lucide-static']
    }
  }
});
