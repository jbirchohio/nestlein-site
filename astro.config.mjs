import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: 'server',
  adapter: vercel({
    runtime: 'nodejs18@1.0.0' // Use a valid runtime string including a version tag
  }),
  integrations: [tailwind(), react()],
  vite: {
    optimizeDeps: {
      include: ['lucide-static']
    }
  }
});
