import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			'@archie/web': 'src',
			'@archie/shared': '../../packages/shared/src'
		}
	}
};

export default config;
