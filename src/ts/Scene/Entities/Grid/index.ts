import * as GLP from 'glpower';

import { power, world, gl, globalUniforms } from "~/ts/Globals";
import { ComponentBLidge, ComponentEvents } from "../../Component";
import { getBaseMaterial, ComponentMaterial } from "../../Component/Material";
import { disposeComponentGeometry, disposeComponentMaterial } from '../../Utils/Disposer';

import gridVert from './shaders/grid.vs';
import gridFrag from './shaders/grid.fs';

export const grid = ( entity: GLP.Entity ) => {

	let num = new GLP.Vector( 100, 4, 10 );

	let componentBlidge = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	/*-------------------------------
		Mesh
	-------------------------------*/

	// geometry

	const geometry = new GLP.SphereGeometry( 0.01, 5, 5 );
	const componentGeometry = geometry.getComponent( power );

	const idArray = [];

	for ( let i = 0; i < num.z; i ++ ) {

		for ( let j = 0; j < num.y; j ++ ) {

			for ( let k = 0; k < num.x; k ++ ) {

				idArray.push(
					k,
					Math.floor( j / 2 ) / ( num.y / 2 - 1 ) - 0.5,
					i,
					j
				);

			}

		}

	}

	componentGeometry.attributes.push( {
		name: 'id',
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( idArray ) ),
		size: 4,
		instanceDivisor: 1
	} );

	// material

	let uniforms = GLP.UniformsUtils.merge( componentBlidge.uniforms, globalUniforms.time, globalUniforms.beat, globalUniforms.resolution, {
		uNum: {
			value: num,
			type: "3fv"
		}
	} );

	const { material } = getBaseMaterial( {
		name: "Gridaa",
		vertexShader: gridVert,
		fragmentShader: gridFrag,
		renderType: 'forward',
		uniforms,
	} );

	GLP.ECS.addComponent( world, entity, 'geometry', componentGeometry );
	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );

	/*-------------------------------
		Events
	-------------------------------*/

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onUpdate.push( ( e ) => {
	} );

	eventComponent.onDispose.push( () => {

		disposeComponentGeometry( componentGeometry );
		disposeComponentMaterial( material );

	} );


	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/grid.vs", "./shaders/grid.fs", ], ( module ) => {

			if ( module[ 0 ] ) {

				material.vertexShader = module[ 0 ].default;

			}

			if ( module[ 1 ] ) {

				material.fragmentShader = module[ 1 ].default;

			}

			material.needsUpdate = true;

		} );

	}


	return entity;

};
