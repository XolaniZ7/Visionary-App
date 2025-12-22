import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ["path-to-regexp", "@react-email/*", "@radix-ui/*"],
      external: ["@prisma/client"],
    },
    build: {
      target: ["esnext"],
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
      exclude: ["@prisma/client"],
    },
  },
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  integrations: [react(), tailwind()],
});
