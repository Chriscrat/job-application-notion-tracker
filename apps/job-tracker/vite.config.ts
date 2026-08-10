import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { cloudflare } from '@cloudflare/vite-plugin'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig(() => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    ...(process.env.VITEST ? [] : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
    tanstackStart(),
    viteReact(),
  ],
}))

export default config
