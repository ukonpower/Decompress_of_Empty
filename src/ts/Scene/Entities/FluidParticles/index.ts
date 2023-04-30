import * as GLP from 'glpower';

import { power, world, gl, globalUniforms, blidge } from "~/ts/Globals";
import { ComponentBLidge, ComponentEvents } from "../../Component";
import { getBaseMaterial, ComponentMaterial } from "../../Component/Material";
import { GPUCompute } from '../../Utils/GPUCompute';
import { disposeComponentGeometry, disposeComponentMaterial } from '../../Utils/Disposer';

import fluidParticlesVert from './shaders/fluidParticles.vs';
import fluidParticlesFrag from './shaders/fluidParticles.fs';

import computeVelocityShader from './shaders/fluidParticlesComputeVelocity.glsl';
import computePositionShader from './shaders/fluidParticlesComputePosition.glsl';

export const fluidParticles = ( entity: GLP.Entity ) => {

	let num = new GLP.Vector( 64, 64 );

	let componentBlidge = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	/*-------------------------------
		GPU
	-------------------------------*/

	const computeVelocity = new GPUCompute( power, num, computeVelocityShader, GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.camera, globalUniforms.time, {
		uPosBuffer: {
			type: '1i',
			value: 0
		}
	} ) );

	const computePosition = new GPUCompute( power, num, computePositionShader, GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.camera, globalUniforms.time, {
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
				gl.texSubImage2D( gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array( [ 0, 0, 0, Math.random() ] ) );

				gl.bindTexture( gl.TEXTURE_2D, computePosition.rt2.textures[ 0 ].getTexture() );
				gl.texSubImage2D( gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array( [ 0, 100, 0, 0 ] ) );

			}

		}

	};

	reset();

	/*-------------------------------
		Mesh
	-------------------------------*/

	// geometry

	const geometry = new GLP.CubeGeometry( 0.5, 0.5, 0.5 );
	const componentGeometry = geometry.getComponent( power );

	const idArray = [];

	for ( let i = 0; i < num.y; i ++ ) {

		for ( let j = 0; j < num.x; j ++ ) {

			idArray.push( j / num.x, i / num.y, Math.random() );

		}

	}

	componentGeometry.attributes.push( {
		name: 'id',
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( idArray ) ),
		size: 3,
		instanceDivisor: 1
	} );

	// material

	let uniforms = GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.beat, globalUniforms.resolution, {
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

	const { material, materialDepth } = getBaseMaterial( {
		name: "planeParticle",
		vertexShader: fluidParticlesVert,
		fragmentShader: fluidParticlesFrag,
		uniforms,
		useLight: true,
	} );

	GLP.ECS.addComponent( world, entity, 'geometry', componentGeometry );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

	/*-------------------------------
		Events
	-------------------------------*/

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onUpdate.push( ( e ) => {

		computeVelocity.uniforms.uPosBuffer.value = computePosition.rt2.textures[ 0 ];
		computePosition.uniforms.uVelBuffer.value = computeVelocity.rt2.textures[ 0 ];

		computeVelocity.compute();
		computePosition.compute();

		uniforms.uComPosBuf.value = computePosition.rt2.textures[ 0 ];
		uniforms.uComVelBuf.value = computeVelocity.rt2.textures[ 0 ];

	} );

	eventComponent.onDispose.push( () => {

		computePosition.dispose();
		computeVelocity.dispose();

		disposeComponentGeometry( componentGeometry );
		disposeComponentMaterial( material );

	} );


	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/fluidParticles.vs", "./shaders/fluidParticles.fs", ], ( module ) => {

			if ( module[ 0 ] ) {

				material.vertexShader = module[ 0 ].default;

			}

			if ( module[ 1 ] ) {

				material.fragmentShader = module[ 1 ].default;

			}

			material.needsUpdate = true;

		} );

		import.meta.hot.accept( "./shaders/fluidParticlesComputePosition.glsl", ( module ) => {

			if ( module ) {

				computePosition.replaceShader( module.default );

			}

			material.needsUpdate = true;

		} );

		import.meta.hot.accept( "./shaders/fluidParticlesComputeVelocity.glsl", ( module ) => {

			if ( module ) {

				computeVelocity.replaceShader( module.default );

			}

			material.needsUpdate = true;

		} );

	}


	return entity;

};
