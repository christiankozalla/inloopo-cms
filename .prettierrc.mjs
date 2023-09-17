/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  semi: true,
  printWidth: 120,
  endOfLine: "lf",
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
};
