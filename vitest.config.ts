import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/tests/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
