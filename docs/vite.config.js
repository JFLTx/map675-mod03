import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/map675-mod03",
  build: {
    outDir: "docs",
  },
  plugins: [tailwindcss()],
});
