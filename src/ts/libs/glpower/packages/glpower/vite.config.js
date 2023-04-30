import path from 'path';
import { defineConfig } from 'vite';
import { peerDependencies } from './package.json';

export default defineConfig( {
	root: 'src',
	build: {
		lib: {
			entry: path.resolve( __dirname, 'src/' ),
			name: 'GLP',
			fileName: 'glpower',
			formats: [ 'es', 'cjs', 'umd', 'iife' ],
		},
		rollupOptions: {
			external: [ ...Object.keys( peerDependencies ) ],
			output: {
				dir: './build',
				globals: {
				},
			},
		},
		sourcemap: true,
	},
} );
