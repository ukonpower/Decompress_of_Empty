import * as GLP from 'glpower';
import { gl, globalUniforms, power, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents, ComponentGeometry } from '../../Component';
import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';
import { disposeComponentGeometry } from '../../Utils/Disposer';

import ringsVert from './shaders/rings.vs';
import ringsFrag from './shaders/rings.fs';
import { hotGet, hotUpdate } from '../../Utils/Hot';

export const rings = ( entity: GLP.Entity ) => {

	const componentBlidge = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	// geometry

	let geometry = new GLP.CubeGeometry( 0.02, 1.0, 0.02 ).getComponent( power );

	const n = 70;
	const idArray = [];

	const nh = n / 2.0;

	for ( let i = 0; i < n; i ++ ) {

		idArray.push( i, ( i % nh ) / nh, ( i < nh ) ? 0 : 1 );

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
		vertexShader: ringsVert,
		fragmentShader: ringsFrag,
		uniforms: GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.time, globalUniforms.beat, {} )
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

	// events

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;
	eventComponent.onDispose.push( () => {

		disposeComponentGeometry( geometry );

	} );

	if ( import.meta.hot ) {

		material.fragmentShader = materialDepth.fragmentShader = hotGet( "ring.fs", ringsFrag );
		material.vertexShader = materialDepth.vertexShader = hotGet( "ring.vs", ringsVert );

		import.meta.hot.accept( [ "./shaders/rings.vs", "./shaders/rings.fs" ], ( module ) => {

			if ( module[ 0 ] ) {

				materialDepth.vertexShader = material.vertexShader = hotUpdate( "ring.vs", module[ 0 ].default );

			}

			if ( module[ 1 ] ) {

				material.fragmentShader = hotUpdate( "ring.fs", module[ 1 ].default );

			}

			materialDepth.needsUpdate = material.needsUpdate = true;

		} );

	}

};
