import * as GLP from 'glpower';


import { RenderSystem } from './Systems/RenderSystem';
import { TransformSystem } from './Systems/TransformSystem';
import { BLidgeSystem } from './Systems/BLidgeSystem';
import { CameraSystem } from './Systems/CameraSystem';
import { EventSystem } from './Systems/EventSystem';
import { Music } from './Music';
import { OrbitControlSystem } from './Systems/OrbitControlSystem';
import { LookAtSystem } from './Systems/LookAtSystem';
import { gBuffer, globalUniforms, power, sceneGraph, world } from '../Globals';
import { appendPostProcess } from './Entities/PostProcess';
import { appendEmpty, appendEvent } from './Entities/Common';
import { appendMainCamera } from './Entities/MainCamera';
import { createParticles } from './Entities/Particles';

export class Scene extends GLP.EventEmitter {

	private root: GLP.Entity;
	private music: Music;

	constructor( canvas: HTMLCanvasElement ) {

		super();

		// -------- render target

		// forward

		const outBuffer = power.createFrameBuffer();
		outBuffer.setDepthBuffer( gBuffer.depthRenderBuffer );
		outBuffer.setTexture( [ power.createTexture() ] );

		// -------- objects

		this.root = GLP.ECS.createEntity( world );
		appendEmpty( this.root );

		// camera

		let camera = GLP.ECS.createEntity( world );
		appendEmpty( camera );
		appendEvent( camera );
		appendMainCamera( camera, {
			near: 0.1,
			far: 1000.0,
			fov: 50,
			rt: {
				gBuffer: gBuffer,
				output: outBuffer,
			}
		} );

		// postprocess

		let postprocess = GLP.ECS.createEntity( world );
		appendEvent( postprocess );
		appendPostProcess( postprocess, outBuffer, gBuffer.textures, camera, null );

		// -------- objects

		let particles = createParticles();

		sceneGraph.add( this.root, particles );

		/*-------------------------------
			System
		-------------------------------*/

		const blidgeSystem = new BLidgeSystem( this.root, camera );
		GLP.ECS.addSystem( world, 'blidge', blidgeSystem );

		const eventSystem = new EventSystem();
		GLP.ECS.addSystem( world, 'event', eventSystem );

		const transformSystem = new TransformSystem();
		GLP.ECS.addSystem( world, 'pre_transform', transformSystem );

		const lookAtSystem = new LookAtSystem();
		GLP.ECS.addSystem( world, 'lookAt', lookAtSystem );

		if ( process.env.NODE_ENV == 'development' ) {

			const orbitControlSystem = new OrbitControlSystem( canvas );
			GLP.ECS.addSystem( world, 'orbitControl', orbitControlSystem );

		}

		GLP.ECS.addSystem( world, 'main_transform', transformSystem );

		const cameraSystem = new CameraSystem();
		GLP.ECS.addSystem( world, 'camera', cameraSystem );

		const renderSystem = new RenderSystem();
		GLP.ECS.addSystem( world, 'render', renderSystem );

		/*-------------------------------
			Music
		-------------------------------*/

		this.music = new Music( power );

		blidgeSystem.on( 'seek', ( t: number, isPlaying: boolean ) => {

			if ( isPlaying ) {

				this.music.play( t );

			} else {

				this.music.stop();

			}

		} );

		/*-------------------------------
			Events
		-------------------------------*/

		// play

		this.on( 'play', () => {

			this.music.play( 0 );

			blidgeSystem.play();

		} );

		// resize

		const onResize = ( size: GLP.Vector, pixelRatio: number ) => {

			const viewSize = size.clone();
			const pixelSize = size.clone().multiply( pixelRatio );

			eventSystem.resize( world, pixelSize );
			cameraSystem.resize( world, pixelSize );
			renderSystem.resize( viewSize, pixelSize );

		};

		this.on( 'resize', onResize );

		// dispose

		this.once( "dispose", () => {

			this.off( 'resize', onResize );

		} );

	}

	public resize( size: GLP.Vector, pixelRatio: number ) {

		( globalUniforms.resolution.uResolution.value as GLP.Vector ).copy( size );

		globalUniforms.resolution.uAspectRatio.value = size.x / size.y;

		this.emit( 'resize', [ size, pixelRatio ] );

	}

	public update() {

		GLP.ECS.update( world );

		globalUniforms.time.uTime.value = world.elapsedTime;

	}

	public play() {

		this.emit( 'play' );

	}

	public dispose() {

		this.emit( 'dispose' );

	}

}
