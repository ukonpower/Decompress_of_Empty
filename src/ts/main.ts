import * as GLP from 'glpower';
import { blidge, canvas, gpuState, world } from './Globals';
import { GPUState } from './GPUState';

import { Scene } from './Scene';

export class Demo {

	// elms
	private rootElm: HTMLElement;
	private canvasWrapElm: HTMLElement;
	private canvas: HTMLCanvasElement;

	// scene

	private scene: Scene;

	// status

	private gpuState?: GPUState;

	constructor( ) {

		document.body.innerHTML = `
		<style>
			body{margin:0;}
			button{display:block;width:200px;margin:0 auto 10px auto;padding:10px;border:1px solid #fff;background:none;color:#fff;cursor:pointer;}
			canvas{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}
			.r{width:100%;height:100%;position:relative;overflow:hidden;display:flex;background:#000;}
			.cw{position:relative;flex:1 1 100%;display:none;}
			.s{width:100vw;height:100vh;display:flex;flex-direction:column;justify-content:center;}
		</style>
		`;

		document.title = "Decompress of Empty";

		this.rootElm = document.createElement( 'div' );
		this.rootElm.classList.add( 'r' );
		document.body.appendChild( this.rootElm );

		this.canvasWrapElm = document.createElement( 'div' );
		this.canvasWrapElm.classList.add( 'cw' );
		this.rootElm.appendChild( this.canvasWrapElm );

		this.canvas = canvas;
		this.canvasWrapElm.appendChild( this.canvas );

		let startElm = document.createElement( 'div' );
		startElm.classList.add( "s" );
		this.rootElm.appendChild( startElm );

		let fullScreen = document.createElement( 'button' );
		fullScreen.innerText = '1. Full Screen';
		fullScreen.onclick = () => {

			var elem = document.documentElement;

			if ( elem.requestFullscreen ) {

				elem.requestFullscreen();

			}


		};

		startElm.appendChild( fullScreen );

		const play = () => {

			startElm.style.display = "none";
			this.canvasWrapElm.style.display = 'block';
			this.canvasWrapElm.style.cursor = 'none';

			this.resize();

			world.elapsedTime = 0;
			world.lastUpdateTime = new Date().getTime();

			this.scene.play();

			this.animate();

		};

		let playButton = document.createElement( 'button' );
		playButton.innerText = 'Precompiling...';
		playButton.disabled = true;
		playButton.onclick = play;

		startElm.appendChild( playButton );

		// scene

		this.scene = new Scene( this.canvas );

		setTimeout( () => {

			this.resize();

			this.scene.update();

			playButton.innerText = '2. Play!';
			playButton.disabled = false;

		}, 100 );

		this.resize();

		window.addEventListener( 'resize', this.resize.bind( this ) );

		// memory

		if ( process.env.NODE_ENV == 'development' ) {

			startElm.style.display = "none";
			this.canvasWrapElm.style.display = 'block';

			blidge.on( 'error', () => {

				startElm.style.display = "flex";
				this.canvasWrapElm.style.display = 'none';

			} );

			if ( gpuState ) {

				const stateElm = document.createElement( 'div' );
				stateElm.style.width = "400px";
				stateElm.style.height = "100%";
				stateElm.style.overflowY = 'auto';
				this.rootElm.appendChild( stateElm );

				gpuState.init( this.canvasWrapElm, stateElm );

			}

			this.animate();

		}

	}

	private animate() {

		this.scene.update();

		if ( process.env.NODE_ENV == 'development' ) {

			if ( gpuState ) {

				gpuState.update();

			}

		}

		window.requestAnimationFrame( this.animate.bind( this ) );

	}

	private resize() {

		const scale = 1.0;
		const width = 1920 * scale, height = 1080 * scale;
		const aspect = width / height;

		const wrapperWidth = this.canvasWrapElm.clientWidth;
		const wrapperHeight = this.canvasWrapElm.clientHeight;
		const wrapperAspect = wrapperWidth / wrapperHeight;

		let canvasStyleWidth = 0;
		let canvasStyleHeight = 0;

		if ( wrapperAspect > aspect ) {

			canvasStyleHeight = wrapperHeight;
			canvasStyleWidth = canvasStyleHeight * aspect;

		} else {

			canvasStyleWidth = wrapperWidth;
			canvasStyleHeight = canvasStyleWidth / aspect;

		}

		this.canvas.style.width = canvasStyleWidth + 'px';
		this.canvas.style.height = canvasStyleHeight + 'px';

		this.canvas.width = width;
		this.canvas.height = height;

		this.scene.resize( new GLP.Vector( this.canvas.width, this.canvas.height ), 1.0 );

	}

}


new Demo();
