/// <reference types="vitest" />

import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      tests: path.resolve(__dirname, './tests'),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['dist/', 'node_modules/', 'src/main.tsx', 'src/components/ui/', 'tests/', '**/*.d.ts', '**/*.config.*'],
    },
  },
})
