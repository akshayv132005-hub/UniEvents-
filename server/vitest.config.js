import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 180000, // first run downloads the in-memory MongoDB binary
  },
})
