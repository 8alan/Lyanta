import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://lyanta.com',
      dynamicRoutes: [
        '/browse',
        '/help',
        '/privacy-policy',
      ]
    })
  ],
})