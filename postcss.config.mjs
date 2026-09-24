import { createRequire } from "node:module";

// Si le scanner natif de Tailwind est bloqué (politique Windows Application
// Control), on utilise un scanner JavaScript de secours. Sans effet quand le
// scanner natif fonctionne. Voir scripts/tailwind-js-scanner/index.cjs.
createRequire(import.meta.url)("./scripts/tailwind-js-scanner/index.cjs").install();

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
