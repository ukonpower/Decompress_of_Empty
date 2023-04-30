import * as GLP from 'glpower';

import { appendEvent, createEmpty } from '../Common';
import { gl, globalUniforms, power, world } from '~/ts/Globals';
import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';

import particlesVert from './shaders/particles.vs';
import particlesFrag from './shaders/particles.fs';
import { ComponentGeometry } from '../../Component';


export const createParticles = () => {

	let range = new GLP.Vector( 30.0, 5.0, 30.0 );

	let entity = createEmpty( {
		position: { x: 0, y: range.y / 2, z: 0 }
	} );

	appendEvent( entity );

	// geometry

	const count = 2000;

	const positionArray = [];
	const sizeArray = [];

	for ( let i = 0; i < count; i ++ ) {

		positionArray.push( ( Math.random() - 0.5 ) * range.x );
		positionArray.push( ( Math.random() - 0.5 ) * range.y );
		positionArray.push( ( Math.random() - 0.5 ) * range.z );

		sizeArray.push( Math.random( ) );

	}

	let componentGeometry: ComponentGeometry = {
		attributes: [ {
			name: "position",
			buffer: power.createBuffer().setData( new Float32Array( positionArray ) ),
			size: 3,
		}, {
			name: "size",
			buffer: power.createBuffer().setData( new Float32Array( sizeArray ) ),
			size: 1,
		}
	 ]
	};

	GLP.ECS.addComponent( world, entity, 'geometry', componentGeometry );

	// material

	const { material } = getBaseMaterial( {
		name: "particles",
		vertexShader: particlesVert,
		fragmentShader: particlesFrag,
		renderType: 'forward',
		drawType: gl.POINTS,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
			uRange: {
				value: range,
				type: "3fv"
			}
		} ),
		useLight: true,
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );

	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/particles.vs", "./shaders/particles.fs" ], ( module ) => {

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
