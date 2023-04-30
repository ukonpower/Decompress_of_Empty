import * as GLP from 'glpower';
import { gl, globalUniforms, power, world } from '~/ts/Globals';

import boxVert from './shaders/ukpBoxBox.vs';
import boxFrag from './shaders/ukpBoxBox.fs';
import { ComponentGeometry, ComponentEvents } from '~/ts/Scene/Component';
import { getBaseMaterial, ComponentMaterial } from '~/ts/Scene/Component/Material';
import { disposeComponentGeometry } from '~/ts/Scene/Utils/Disposer';
import { WireBoxGeometry } from '~/ts/Scene/Geometry/WireBoxGeometry';

export const ukpBoxBox = ( entity: GLP.Entity ) => {

	// geometry

	let geo = new GLP.Geometry();

	let { posArray, normalArray, uvArray, indexArray } = WireBoxGeometry( 2.0, 2.0, 2.0, 0.05 );

	geo.setAttribute( 'position', posArray, 3 );
	geo.setAttribute( 'normal', normalArray, 3 );
	geo.setAttribute( 'uv', uvArray, 2 );
	geo.setAttribute( 'index', indexArray, 1 );

	let geometryComponent = geo.getComponent( power );

	const n = 15;
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
		vertexShader: boxVert,
		fragmentShader: boxFrag,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.beat, {} )
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

	// events

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onDispose.push( () => {

		disposeComponentGeometry( geometryComponent );

	} );

	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/ukpBoxBox.vs", "./shaders/ukpBoxBox.fs" ], ( module ) => {

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
