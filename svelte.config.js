import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js"
import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
		adapter: adapter()
	},
    preprocess: [mdsvex(mdsvexConfig)],
    extensions: [".svelte", ".svx", ".md", ".html"]
};

export default config;
