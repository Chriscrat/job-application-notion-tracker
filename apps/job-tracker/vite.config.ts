import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.VITEST;

const config = defineConfig(() => ({
    resolve: { tsconfigPaths: true },
    plugins: [
        devtools(),
        ...(isTest || isDev ? [] : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
        tanstackStart(),
        viteReact(),
        vanillaExtractPlugin(),
    ],
}));

export default config;