import * as GLP from 'glpower';

import { blidge, gl, globalUniforms, power, sceneGraph, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents, ComponentState } from '../../Component';
import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';
import { disposeComponentGeometry, disposeComponentMaterial } from '../../Utils/Disposer';
import { GPUCompute } from '../../Utils/GPUCompute';

import trailVert from './shaders/trail.vs';
import trailFrag from './shaders/trail.fs';

import trailComputePositionShader from './shaders/trailComputePosition.glsl';
import trailComputeVelocityShader from './shaders/trailComputeVelocity.glsl';
import { hotGet, hotUpdate } from '../../Utils/Hot';

export const trail = ( entity: GLP.Entity ) => {

	const num = new GLP.Vector( 32, 512 );
	let componentBlidge = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;
	const state = GLP.ECS.getComponent<ComponentState>( world, entity, 'state' )!;

	/*-------------------------------
		GPU
	-------------------------------*/

	const computeVelocity = new GPUCompute( power, num, trailComputeVelocityShader, GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.camera, globalUniforms.time, {
		uPosBuffer: {
			type: '1i',
			value: 0
		}
	} ) );

	const computePosition = new GPUCompute( power, num, trailComputePositionShader, GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.camera, globalUniforms.time, {
		uVelBuffer: {
			type: '1i',
			value: 0
		}
	} ) );

	const reset = () => {

		for ( let i = 0; i < num.y; i ++ ) {

			for ( let j = 0; j < num.x; j ++ ) {

				const x = j;
				const y = i;

				gl.bindTexture( gl.TEXTURE_2D, computeVelocity.rt2.textures[ 0 ].getTexture() );
				gl.texSubImage2D( gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array( [ 0, 0, 0, 0 ] ) );

				gl.bindTexture( gl.TEXTURE_2D, computePosition.rt2.textures[ 0 ].getTexture() );
				gl.texSubImage2D( gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array( [ 0, 0, 0, 0 ] ) );

			}

		}

	};

	reset();

	const idArray = [];

	for ( let i = 0; i < num.y; i ++ ) {

		idArray.push( i / num.y, Math.random(), Math.random() );

	}

	let uniforms = GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.time, globalUniforms.beat, globalUniforms.resolution, {
		uComVelBuf: {
			value: 0,
			type: '1i',
		},
		uComPosBuf: {
			value: 0,
			type: '1i',
		},
		uComputeSize: {
			value: computePosition.size,
			type: '2fv'
		}
	} );

	// geometry

	const lineIdArray = [];

	for ( let i = 0; i < num.y; i ++ ) {

		lineIdArray.push( i / num.y, Math.random(), Math.random() );

	}

	let size = 0.05;

	let geometryComponent = new GLP.CubeGeometry( size, size, size, 1.0, num.x - 1, 1.0 ).getComponent( power );
	geometryComponent.attributes.push( {
		name: 'trailId',
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( lineIdArray ) ),
		size: 3,
		instanceDivisor: 1
	} );

	GLP.ECS.addComponent( world, entity, 'geometry', geometryComponent );

	// material

	const { material: trailMaterial, materialDepth: trailDepthMaterial } = getBaseMaterial( {
		name: "matchMove/line",
		vertexShader: trailVert,
		fragmentShader: trailFrag,
		renderType: 'deferred',
		uniforms,
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', trailMaterial );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', trailDepthMaterial );

	sceneGraph.add( entity, entity );

	/*-------------------------------
		Events
	-------------------------------*/

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onUpdate.push( ( e ) => {

		if ( state.visible ) {

			computeVelocity.uniforms.uPosBuffer.value = computePosition.rt2.textures[ 0 ];
			computePosition.uniforms.uVelBuffer.value = computeVelocity.rt2.textures[ 0 ];

			computeVelocity.compute();
			computePosition.compute();

			uniforms.uComPosBuf.value = computePosition.rt2.textures[ 0 ];
			uniforms.uComVelBuf.value = computeVelocity.rt2.textures[ 0 ];

		}

	} );

	eventComponent.onDispose.push( () => {

		computePosition.dispose();
		computeVelocity.dispose();

		disposeComponentGeometry( geometryComponent );
		disposeComponentMaterial( trailMaterial );

	} );

	if ( import.meta.hot ) {

		trailMaterial.vertexShader = trailDepthMaterial.vertexShader = hotGet( 'trail.vs', trailVert );
		trailMaterial.fragmentShader = trailDepthMaterial.fragmentShader = hotGet( 'trail.fs', trailFrag );

		import.meta.hot.accept( [ "./shaders/trail.vs", "./shaders/trail.fs" ], ( module ) => {

			if ( module[ 0 ] ) {

				trailMaterial.vertexShader = trailDepthMaterial.vertexShader = hotUpdate( 'trail.vs', module[ 0 ].default );

			}

			if ( module[ 1 ] ) {

				trailMaterial.fragmentShader = trailDepthMaterial.fragmentShader = hotUpdate( 'trail.fs', module[ 1 ].default );

			}

			trailMaterial.needsUpdate = true;

		} );

		import.meta.hot.accept( "./shaders/trailComputePosition.glsl", ( module ) => {

			if ( module ) {

				computePosition.replaceShader( module.default );

			}

		} );

		import.meta.hot.accept( "./shaders/trailComputeVelocity.glsl", ( module ) => {

			if ( module ) {

				computeVelocity.replaceShader( module.default );

			}

		} );

	}



};
