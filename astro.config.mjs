import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import { processCustomAssets } from "./scripts/process-custom-assets.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://www.inloopo.com",
  output: "server",
  scopedStyleStrategy: "where",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [processCustomAssets]
});
