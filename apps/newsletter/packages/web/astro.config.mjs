// @ts-check
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

const site = process.env.BASE_URL ?? 'https://newsletter.example.com'

export default defineConfig({
  site,
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
})
