import { exec } from "node:child_process";
import { join } from "node:path";

const compileDynamicChartHook = (options) => {
  const isBuidStep = options?.dir?.pathname;
  const pathToSrcScript = isBuidStep? join(options.dir.pathname, "scripts", "dynamic-chart-core.src.js") : join(process.cwd(), "public", "scripts", "dynamic-chart-core.src.js");
  const pathToOutScript = isBuidStep ? join(options.dir.pathname, "scripts", "dynamic-chart-core.js") : join(process.cwd(), "public", "scripts", "dynamic-chart-core.js");
  exec(
    "esbuild " +
    pathToSrcScript +
      " --bundle --outfile=" +
      pathToOutScript +
      ` --platform=browser --target=es2015 --minify ${isBuidStep ? "" : " --watch"}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
  if (isBuidStep) {
    exec(`${join(options.dir.pathname, "..", "scripts", "after-build.sh")}`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }
};

export const processCustomAssets = {
  name: "process-custom-assets",
  hooks: {
    "astro:server:start": compileDynamicChartHook,
    "astro:build:done": compileDynamicChartHook
  },
};
