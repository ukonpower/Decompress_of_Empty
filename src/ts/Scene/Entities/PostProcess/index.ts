import * as GLP from 'glpower';

import { globalUniforms, power, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents, ComponentPostProcess, PostProcessPass } from '../../Component';

import quadVert from '~/ts/shaders/quad.vs';
import fxaaFrag from './shaders/fxaa.fs';
import bloomBlurFrag from './shaders/bloomBlur.fs';
import bloomBrightFrag from './shaders/bloomBright.fs';
import compositeFrag from './shaders/composite.fs';

export const appendPostProcess = ( entity: GLP.Entity, input: GLP.GLPowerFrameBuffer, gBuffer: GLP.GLPowerTexture[], camera: GLP.Entity, out: GLP.GLPowerFrameBuffer | null ) => {

	let gl = power.gl;

	const bloomRenderCount = 4;

	const events = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	// rt

	const rt1 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [ power.createTexture() ] );
	const rt2 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [ power.createTexture() ] );
	const rt3 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [ power.createTexture() ] );

	const rtBloomVertical: GLP.GLPowerFrameBuffer[] = [];
	const rtBloomHorizonal: GLP.GLPowerFrameBuffer[] = [];

	for ( let i = 0; i < bloomRenderCount; i ++ ) {

		rtBloomVertical.push( new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] ) );

		rtBloomHorizonal.push( new GLP.GLPowerFrameBuffer( gl ).setTexture( [
			power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
		] ) );

	}

	events.onDispose.push( () => {

		rt1.dispose();
		rt2.dispose();
		rt3.dispose();

		rtBloomVertical.forEach( f => f.dispose() );
		rtBloomHorizonal.forEach( f => f.dispose() );

	} );

	// resolution

	const resolution = new GLP.Vector();
	const resolutionInv = new GLP.Vector();
	const resolutionBloom: GLP.Vector[] = [];

	// pp

	const postprocess: ComponentPostProcess = [];

	// fxaa

	postprocess.push( {
		name: "fxaa",
		input: input.textures,
		vertexShader: quadVert,
		fragmentShader: fxaaFrag,
		renderTarget: rt1,
		uniforms: {
			uResolution: {
				type: '2fv',
				value: resolution
			},
			uResolutionInv: {
				type: '2fv',
				value: resolutionInv
			},
		}
	} );

	// bloom bright

	const bloomBright: PostProcessPass = {
		name: "bloom/bright",
		input: rt1.textures,
		renderTarget: rt2,
		vertexShader: quadVert,
		fragmentShader: bloomBrightFrag,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
			threshold: {
				type: '1f',
				value: 0.5,
			},
		} ),
	};

	postprocess.push( bloomBright );

	// bloom blur

	let bloomInput: GLP.GLPowerTexture[] = rt2.textures;

	for ( let i = 0; i < bloomRenderCount; i ++ ) {

		const rtVertical = rtBloomVertical[ i ];
		const rtHorizonal = rtBloomHorizonal[ i ];

		const resolution = new GLP.Vector();
		resolutionBloom.push( resolution );

		postprocess.push( {
			name: "bloom/blur" + i + '/vertical',
			input: bloomInput,
			renderTarget: rtVertical,
			vertexShader: quadVert,
			fragmentShader: bloomBlurFrag,
			uniforms: {
				uIsVertical: {
					type: '1i',
					value: true
				},
				uWeights: {
					type: '1fv',
					value: weight( bloomRenderCount )
				},
				uResolution: {
					type: '2fv',
					value: resolution,
				}
			},
			defines: {
				GAUSS_WEIGHTS: bloomRenderCount.toString()
			}
		} );

		postprocess.push( {
			name: "bloom/blur" + i + '/horizontal',
			input: rtVertical.textures,
			renderTarget: rtHorizonal,
			vertexShader: quadVert,
			fragmentShader: bloomBlurFrag,
			uniforms: {
				uIsVertical: {
					type: '1i',
					value: false
				},
				uWeights: {
					type: '1fv',
					value: weight( bloomRenderCount )
				},
				uResolution: {
					type: '2fv',
					value: resolution,
				}
			},
			defines: {
				GAUSS_WEIGHTS: bloomRenderCount.toString()
			} } );

		bloomInput = rtHorizonal.textures;

	}

	// composite

	const composite: PostProcessPass = {
		name: "composite",
		input: rt1.textures,
		renderTarget: out,
		vertexShader: quadVert,
		fragmentShader: compositeFrag,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
			uBloomTexture: {
				value: rtBloomHorizonal.map( rt => rt.textures[ 0 ] ),
				type: '1iv'
			}
		} ),
		defines: {
			BLOOM_COUNT: bloomRenderCount.toString()
		}
	};

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/composite.fs", ( module ) => {

			if ( module ) {

				composite.fragmentShader = module.default;
				composite.needsUpdate = true;

			}

		} );

	}

	postprocess.push( composite );

	GLP.ECS.addComponent<ComponentPostProcess>( world, entity, 'postprocess', postprocess );

	// events

	let eventsComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventsComponent.onResize.push( ( e ) => {

		resolution.copy( e.size );
		resolutionInv.set( 1.0, 1.0 ).divide( e.size );

		rt1.setSize( e.size );
		rt2.setSize( e.size );
		rt3.setSize( e.size );

		let scale = 2;

		for ( let i = 0; i < bloomRenderCount; i ++ ) {

			resolutionBloom[ i ].copy( e.size ).multiply( 1.0 / scale );

			rtBloomHorizonal[ i ].setSize( resolutionBloom[ i ] );
			rtBloomVertical[ i ].setSize( resolutionBloom[ i ] );

			scale *= 2.0;

		}


	} );

	let cameraEventsComponent = GLP.ECS.getComponent<ComponentEvents>( world, camera, 'events' )!;

	cameraEventsComponent.onUpdateBlidgeScene.push( ( e ) => {

		const componentBlidge = GLP.ECS.getComponent<ComponentBLidge>( world, camera, 'blidge' );

		if ( componentBlidge ) {

			composite.uniforms = {
				...composite.uniforms,
				...componentBlidge.uniforms
			};

			bloomBright.uniforms = {
				...bloomBright.uniforms,
				...componentBlidge.uniforms
			};

		}

	} );

	return entity;

};


const weight = ( num: number ) => {

	const weight = new Array( num );

	// https://wgld.org/d/webgl/w057.html
	let t = 0.0;
	const d = 100;
	for ( let i = 0; i < weight.length; i ++ ) {

		const r = 1.0 + 2.0 * i;
		let w = Math.exp( - 0.5 * ( r * r ) / d );
		weight[ i ] = w;

		if ( i > 0 ) {

			w *= 2.0;

		}

		t += w;

	}

	for ( let i = 0; i < weight.length; i ++ ) {

		weight[ i ] /= t;

	}

	return weight;

};
