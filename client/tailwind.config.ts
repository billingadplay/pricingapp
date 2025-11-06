import type { Config } from "tailwindcss";
import baseConfig from "../tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
} satisfies Config;
