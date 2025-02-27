import { svelteTesting } from "@testing-library/svelte/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { pagefind } from "vite-plugin-pagefind";

export default defineConfig({
    plugins: [sveltekit()],

    test: {
        workspace: [{
            extends: "./vite.config.js",
            plugins: [
                svelteTesting(),
                pagefind()
            ],

            test: {
                name: "client",
                environment: "jsdom",
                clearMocks: true,
                include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                exclude: ['src/lib/server/**'],
                setupFiles: ['./vitest-setup-client.js']
            }
        }, {
            extends: "./vite.config.js",

            test: {
                name: "server",
                environment: "node",
                include: ['src/**/*.{test,spec}.{js,ts}'],
                exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
            }
        }]
    }
});
