import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: 'server',
  adapter: vercel({
    runtime: 'nodejs18.x' // ✅ Use valid runtime for Vercel
  }),
  integrations: [tailwind(), react()],
  vite: {
    optimizeDeps: {
      include: ['lucide-static']
    }
  }
});
