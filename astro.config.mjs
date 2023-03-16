import { defineConfig } from "astro/config";

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.inloopo.com",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://www.inloopo.com/de/vielen-dank/'
    }),
  ],
});
