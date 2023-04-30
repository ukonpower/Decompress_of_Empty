import * as GLP from 'glpower';

import { RenderSystem } from './Systems/RenderSystem';
import { TransformSystem } from './Systems/TransformSystem';
import { BLidgeSystem } from './Systems/BLidgeSystem';
import { CameraSystem } from './Systems/CameraSystem';
import { EventSystem } from './Systems/EventSystem';
import { Factory } from './Factory';
import { SceneGraph } from './SceneGraph';
import { Music } from './Music';

export class Scene extends GLP.EventEmitter {

	private gl: WebGL2RenderingContext;
	private power: GLP.Power;
	private world: GLP.World;

	private sceneGraph: SceneGraph;
	private factory: Factory;

	private music: Music;

	constructor( power: GLP.Power ) {

		super();

		// glp

		this.power = power;
		this.gl = this.power.gl;

		/*-------------------------------
			ECS
		-------------------------------*/

		this.world = GLP.ECS.createWorld();

		/*-------------------------------
			Scene
		-------------------------------*/

		this.sceneGraph = new SceneGraph( this.world );
		this.factory = new Factory( this.power, this.world );

		// -------- render target

		// deferred

		const deferredRenderTarget = this.power.createFrameBuffer();

		deferredRenderTarget.setTexture( [
			this.power.createTexture().setting( { type: this.gl.FLOAT, internalFormat: this.gl.RGBA32F, format: this.gl.RGBA } ),
			this.power.createTexture().setting( { type: this.gl.FLOAT, internalFormat: this.gl.RGBA32F, format: this.gl.RGBA } ),
			this.power.createTexture(),
			this.power.createTexture(),
		] );

		const deferredCompositorRenderTarget = this.power.createFrameBuffer();
		deferredCompositorRenderTarget.setTexture( [ this.power.createTexture().setting( { magFilter: this.gl.LINEAR, minFilter: this.gl.LINEAR, generateMipmap: true } ) ] );

		// forward

		const forwardRenderTarget = this.power.createFrameBuffer();
		forwardRenderTarget.setTexture( [ this.power.createTexture() ] );

		// -------- camera

		const camera = this.factory.camera( {}, {
			forwardRenderTarget,
			deferredRenderTarget,
			deferredCompositorRenderTarget
		} );

		this.factory.postprocess( deferredCompositorRenderTarget, deferredRenderTarget.textures, camera, null );

		/*-------------------------------
			System
		-------------------------------*/

		const blidgeSystem = new BLidgeSystem( this.power, this.world, camera, this.sceneGraph, this.factory );
		const transformSystem = new TransformSystem( blidgeSystem.sceneGraph );
		const eventSystem = new EventSystem();
		const cameraSystem = new CameraSystem();
		const renderSystem = new RenderSystem( this.power );

		// adddd

		GLP.ECS.addSystem( this.world, 'blidge', blidgeSystem );
		GLP.ECS.addSystem( this.world, 'transform', transformSystem );
		GLP.ECS.addSystem( this.world, 'camera', cameraSystem );
		GLP.ECS.addSystem( this.world, 'event', eventSystem );
		GLP.ECS.addSystem( this.world, 'render', renderSystem );

		/*-------------------------------
			Music
		-------------------------------*/

		this.music = new Music( this.power );

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

		// resize

		const onResize = ( size: GLP.Vector, pixelRatio: number ) => {

			const viewSize = size.clone();
			const pixelSize = size.clone().multiply( pixelRatio );

			eventSystem.resize( this.world, pixelSize );
			cameraSystem.resize( this.world, pixelSize );
			renderSystem.resize( viewSize, pixelSize );

		};

		this.on( 'resize', onResize );

		// dispose

		this.once( "dispose", () => {

			this.off( 'resize', onResize );

		} );

	}

	public resize( size: GLP.Vector, pixelRatio: number ) {

		this.emit( 'resize', [ size, pixelRatio ] );

	}

	public update() {

		GLP.ECS.update( this.world );

	}

	public dispose() {

		this.emit( 'dispose' );

	}

}
