import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Remove any SSR specific configurations if they're causing issues
		adapter: adapter(), // Use static adapter for CSR
	}
};

export default config;
