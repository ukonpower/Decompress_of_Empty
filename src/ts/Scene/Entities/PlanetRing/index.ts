import * as GLP from 'glpower';

import { getBaseMaterial, ComponentMaterial } from '../../Component/Material';
import { power, gl, world, globalUniforms } from '~/ts/Globals';
import { ComponentGeometry, ComponentEvents, ComponentBLidge } from '~/ts/Scene/Component';
import { disposeComponentGeometry } from '~/ts/Scene/Utils/Disposer';

// import ukpPlanet from './shaders/ukpPlanet.fs';
import planetRingVert from './shaders/planetRing.vs';
import planetRingFrag from './shaders/planetRing.fs';

// export const materialUkpPlanet = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

// 	material.fragmentShader = materialDepth.fragmentShader = ukpPlanet;

// 	if ( import.meta.hot ) {

// 		import.meta.hot.accept( "./shaders/ukpPlanet.fs", ( module ) => {

// 			if ( module ) {

// 				material.fragmentShader = materialDepth.fragmentShader = module.default;
// 				material.needsUpdate = materialDepth.needsUpdate = true;

// 			}

// 		} );

// 	}

// };


export const planetRing = ( entity: GLP.Entity ) => {

	const blidgeObjectComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	// geometry

	let geo = new GLP.TorusGeometry( 2.0, 0.005, 50, 5 );

	let geometryComponent = geo.getComponent( power );

	const n = 5;
	const idArray = [];

	for ( let i = 0; i < n; i ++ ) {

		idArray.push( i, i / n, 0 );

	}

	geometryComponent.attributes.push( {
		name: "id",
		size: 3,
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( idArray ) ),
		instanceDivisor: 1
	} );

	GLP.ECS.addComponent<ComponentGeometry>( world, entity, 'geometry', geometryComponent );

	// material

	const { material, materialDepth } = getBaseMaterial( {
		vertexShader: planetRingVert,
		fragmentShader: planetRingFrag,
		uniforms: GLP.UniformsUtils.merge( blidgeObjectComponent.uniforms, globalUniforms.time, globalUniforms.beat, {} )
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

	// events

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onDispose.push( () => {

		disposeComponentGeometry( geometryComponent );

	} );

	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/planetRing.vs", "./shaders/planetRing.fs" ], ( module ) => {

			if ( module[ 0 ] ) {

				materialDepth.vertexShader = material.vertexShader = module[ 0 ].default;

			}

			if ( module[ 1 ] ) {

				material.fragmentShader = module[ 1 ].default;

			}

			materialDepth.needsUpdate = material.needsUpdate = true;

		} );

	}

};
