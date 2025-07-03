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
    },
  },
  test: {
    browser: {
      enabled: true,
      instances: [{ browser: 'chromium' }],
      provider: process.env.CI ? 'playwright' : 'preview',
      headless: !!process.env.CI,
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
  },
})
