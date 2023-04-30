import * as GLP from 'glpower';

import { Scene } from './Scene';

export class Demo {

	// contexts

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private core: GLP.Power;

	// scene

	private scene: Scene;

	constructor( canvas: HTMLCanvasElement, gl: WebGL2RenderingContext ) {

		this.canvas = canvas;
		this.gl = gl;
		this.core = new GLP.Power( this.gl );

		// scene

		this.scene = new Scene( this.core );

		// events

		window.addEventListener( 'resize', this.resize.bind( this ) );
		this.resize();

		// animate

		this.animate();

	}

	private animate() {

		this.scene.update();

		window.requestAnimationFrame( this.animate.bind( this ) );

	}

	private resize() {

		const aspect = 16 / 9;
		const windowAspect = window.innerWidth / window.innerHeight;

		if ( windowAspect > aspect ) {

			this.canvas.height = window.innerHeight;
			this.canvas.width = this.canvas.height * aspect;

		} else {

			this.canvas.width = window.innerWidth;
			this.canvas.height = this.canvas.width / aspect;

		}

		this.scene.resize( new GLP.Vector( this.canvas.width, this.canvas.height ), 1.0 );

	}

}

window.addEventListener( 'DOMContentLoaded', () => {

	const canvas = document.querySelector<HTMLCanvasElement>( '#canvas' )!;

	const gl = canvas.getContext( 'webgl2' );

	if ( ! gl ) {

		alert( 'unsupported webgl...' );

		return;

	}

	new Demo( canvas, gl );

} );
