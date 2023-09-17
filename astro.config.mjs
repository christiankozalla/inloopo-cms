import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { processCustomAssets } from "./scripts/process-custom-assets.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://www.inloopo.com",
  output: "static",
  scopedStyleStrategy: "where",
  integrations: [
    sitemap({
      filter: (page) =>
        page !== "https://www.inloopo.com/de/vielen-dank/" && page !== "https://www.inloopo.com/thank-you/",
    }),
    processCustomAssets,
  ],
});
