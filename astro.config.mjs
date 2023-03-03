import { defineConfig } from "astro/config";

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.inloopo.com",
  output: "static",
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url.endsWith("/")) {
          item.url = item.url.slice(0, -1);
        }
        return item;
      },
    }),
  ],
});
