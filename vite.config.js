import path from 'path';
import { defineConfig } from 'vite';
import glslify from 'rollup-plugin-glslify'
import { visualizer } from 'rollup-plugin-visualizer';
import shaderminifier from './plugins/shader-minifier-loader';
import image from '@rollup/plugin-image'

const pageList = [
	{ name: 'index', path: '/' },
];

const input = {
	...( () => {

		const exEntryList = {};

		pageList.forEach( ( page ) => {

			exEntryList[ page.name || page.path ] = path.resolve( __dirname, 'src/', page.path, '/index.html' );

		} );

		return exEntryList;

	} )(),
};

const basePath = process.env.GITHUB_PAGES ? '/untitled' : '';

export default defineConfig( {
	root: 'src',
	server: {
		port: 3000,
		host: "0.0.0.0",
		hmr: {
			reload: true
		}
	},
	build: {
		minify: 'terser',
		rollupOptions: {
			input,
			output: {
				dir: './public',
				entryFileNames: 'index.js'
			}
		},
	},
	resolve: {
		alias: {
			"glpower": path.join( __dirname, "src/ts/libs/glpower/packages/glpower/src" ),
			"~": path.join( __dirname, "src" )
		},
	},
	plugins: [
		{
			...image(),
			enforce: "pre"
		},
		{
			...glslify( {
				basedir: './src/glsl/',
				transform: [
					[ 'glslify-hex' ],
					[ 'glslify-import' ]
				],
				compress: false,
			} ),
			enforce: 'pre'
		},
		{
			...shaderminifier(),
			enforce: 'pre'
		},
		visualizer({
			template: "treemap"
		}),
	],
	define: {
		BASE_PATH: `"${basePath}"`
	}
} );
