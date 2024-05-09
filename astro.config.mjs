import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { processCustomAssets } from "./scripts/process-custom-assets.mjs";
import { generateVideoSitemap } from "./scripts/video-sitemap.mjs";


// https://astro.build/config
export default defineConfig({
  site: "https://www.inloopo.com",
  output: "static",
  scopedStyleStrategy: "where",
  integrations: [
    sitemap({
      filter: (page) =>
        page !== "https://www.inloopo.com/de/vielen-dank/" && page !== "https://www.inloopo.com/thank-you/",
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          de: "de",
        },
      },
    }),
    processCustomAssets,
    generateVideoSitemap({
      sitemapFilename: "video-sitemap.xml",
      filter: ({ pathname }) =>
        pathname !== "de/vielen-dank/" && pathname !== "thank-you/",
    })
  ],
});
