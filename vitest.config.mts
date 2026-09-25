import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Same "@/…" alias as tsconfig.json, so tests can import modules that use it (e.g. the API routes)
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
})
