
import { exec } from "node:child_process";
import { join } from "node:path";

export const processCustomAssets = {
  name: "process-custom-assets",
  hooks: {
    "astro:build:done": (options) => {
      exec('esbuild ' + join(options.dir.pathname, "scripts", "dynamic-chart-core.src.js") + ' --bundle --outfile=' + join(options.dir.pathname, "scripts", "dynamic-chart-core.js") + ' --platform=browser --target=es2015 --minify', (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      exec(`${join(options.dir.pathname, "..", "scripts", "after-build.sh")}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    },
  },
};
