import * as GLP from 'glpower';
import { gl, globalUniforms, power, world } from '~/ts/Globals';
import { ComponentEvents, ComponentGeometry } from '../../Component';
import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';
import { disposeComponentGeometry } from '../../Utils/Disposer';

import lineVert from './shaders/lines.vs';
import lineFrag from './shaders/lines.fs';
import { hotGet, hotUpdate } from '../../Utils/Hot';

export const lines = ( entity: GLP.Entity, blidgeObject: GLP.BLidgeObject ) => {

	// geometry

	let geometry = new GLP.CubeGeometry( 0.1, 5.0, 0.1 ).getComponent( power );

	const n = 100;
	const idArray = [];
	const instancePositionArray = [];

	for ( let i = 0; i < n; i ++ ) {

		idArray.push( i, i / n, Math.random() );
		instancePositionArray.push( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );

	}

	geometry.attributes.push( {
		name: "id",
		size: 3,
		count: n,
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( idArray ) ),
		instanceDivisor: 1
	} );

	geometry.attributes.push( {
		name: "instancePosition",
		size: 3,
		count: n,
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( instancePositionArray ) ),
		instanceDivisor: 1
	} );

	GLP.ECS.addComponent<ComponentGeometry>( world, entity, 'geometry', geometry );

	// material

	const { material, materialDepth } = getBaseMaterial( {
		vertexShader: lineVert,
		fragmentShader: lineFrag,
		renderType: 'deferred',
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.beat, {} )
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

	// events

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;
	eventComponent.onDispose.push( () => {

		disposeComponentGeometry( geometry );

	} );

	if ( import.meta.hot ) {

		materialDepth.vertexShader = material.vertexShader = hotGet( 'lines.vs', lineVert );
		materialDepth.fragmentShader = material.fragmentShader = hotGet( 'lines.fs', lineFrag );

		import.meta.hot.accept( [ "./shaders/lines.vs", "./shaders/lines.fs" ], ( module ) => {

			if ( module[ 0 ] ) {

				materialDepth.vertexShader = material.vertexShader = module[ 0 ].default;
				hotUpdate( "line.vs", module[ 0 ].default );

			}

			if ( module[ 1 ] ) {

				material.fragmentShader = module[ 1 ].default;
				hotUpdate( "line.fs", module[ 1 ].default );

			}

			materialDepth.needsUpdate = material.needsUpdate = true;

		} );

	}

};
