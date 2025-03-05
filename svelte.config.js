import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js"
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
		adapter: adapter(),
        prerender: {
            handleHttpError: ({ path, referrer, message }) => {
                return
            },
            handleMissingId: ({ path, referrer, message }) => {
                return
            },
        }
	},
    preprocess: [mdsvex(mdsvexConfig)],
    extensions: [".svelte", ".svx", ".md", ".html"]
};

export default config;
