import * as GLP from 'glpower';
import { gl, globalUniforms, power, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents, ComponentGeometry } from '../../Component';
import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';
import { disposeComponentGeometry } from '../../Utils/Disposer';

import pillarsVert from './shaders/pillars.vs';
import pillarsFrag from './shaders/pillars.fs';

export const pillars = ( entity: GLP.Entity ) => {

	const componentBlidge = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	// geometry

	let geometry = new GLP.CubeGeometry( 0.5, 5.0, 0.5, 1, 2, 1 ).getComponent( power );
	// let geometry = new GLP.CylinderGeometry( 0.3, 0.3, 1.0, 8 ).getComponent( power );

	const n = 32;
	const nn = n * 3;
	const idArray = [];

	for ( let i = 0; i < nn; i ++ ) {

		let hi = i % n;

		idArray.push( hi / ( n ), Math.random(), Math.floor( i / n ) * 2.0 - 1.0 );

	}

	geometry.attributes.push( {
		name: "id",
		size: 3,
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( idArray ) ),
		instanceDivisor: 1
	} );

	GLP.ECS.addComponent<ComponentGeometry>( world, entity, 'geometry', geometry );

	// material

	const { material, materialDepth } = getBaseMaterial( {
		vertexShader: pillarsVert,
		fragmentShader: pillarsFrag,
		uniforms: GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.time, globalUniforms.beat )
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

	// events

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;
	eventComponent.onDispose.push( () => {

		disposeComponentGeometry( geometry );

	} );

	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/pillars.vs", "./shaders/pillars.fs" ], ( module ) => {

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
