import * as GLP from 'glpower';
import { world, sceneGraph, power, globalUniforms, gl } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents } from '../../Component';
import { disposeComponentGeometry } from '../../Utils/Disposer';
import { getBaseMaterial } from '../../Component/Material';

import borderVert from './shaders/border.vs';
import borderFrag from './shaders/border.fs';

import dotVert from './shaders/dots.vs';
import dotFrag from './shaders/dots.fs';

import shapeVert from './shaders/shape.vs';
import shapeFrag from './shaders/shape.fs';

import { appendEmpty } from '../Common';
import { WireBoxGeometry } from '../../Geometry/WireBoxGeometry';

export const hud = ( entity: GLP.Entity ) => {

	const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	const uniforms = GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.resolution, blidgeComponent.uniforms, );

	/*-------------------------------
		Border
	-------------------------------*/

	const border = GLP.ECS.createEntity( world );
	appendEmpty( border );

	const borderGeo = new GLP.PlaneGeometry( 0.7, 0.07 ).getComponent( power );
	borderGeo.attributes.push( {
		name: 'id',
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( [ 0, 1 ] ) ),
		instanceDivisor: 1,
		size: 1
	} );
	const { material: borderMat } = getBaseMaterial( { vertexShader: borderVert, fragmentShader: borderFrag, uniforms, renderType: 'forward' } );

	GLP.ECS.addComponent( world, border, 'material', borderMat );
	GLP.ECS.addComponent( world, border, 'geometry', borderGeo );

	sceneGraph.add( entity, border );

	/*-------------------------------
		SideDot
	-------------------------------*/

	const dots = GLP.ECS.createEntity( world );
	appendEmpty( dots );

	const dotGeo = new GLP.PlaneGeometry( 0.025, 0.025 ).getComponent( power );
	dotGeo.attributes.push( {
		name: 'id',
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( [
			0.0, - 1.0,
			0.0, 0.0,
			0.0, 1.0,
			1.0, - 1.0,
			1.0, 0.0,
			1.0, 1.0,
		] ) ),
		instanceDivisor: 1,
		size: 2
	} );
	const { material: dotMat } = getBaseMaterial( { vertexShader: dotVert, fragmentShader: dotFrag, uniforms, renderType: 'forward' } );

	GLP.ECS.addComponent( world, dots, 'material', dotMat );
	GLP.ECS.addComponent( world, dots, 'geometry', dotGeo );

	sceneGraph.add( entity, dots );

	/*-------------------------------
		Shape
	-------------------------------*/

	const shape = GLP.ECS.createEntity( world );
	appendEmpty( shape );

	const shapeGeoGeo = new GLP.Geometry();

	let { posArray, normalArray, uvArray, indexArray } = WireBoxGeometry( 1.0, 1.0, 1.0, 0.001 );

	shapeGeoGeo.setAttribute( 'position', posArray, 3 );
	shapeGeoGeo.setAttribute( 'normal', normalArray, 3 );
	shapeGeoGeo.setAttribute( 'uv', uvArray, 2 );
	shapeGeoGeo.setAttribute( 'index', indexArray, 1 );

	const shapeGeo = shapeGeoGeo.getComponent( power );

	const { material: shapeMat } = getBaseMaterial( { vertexShader: shapeVert, fragmentShader: shapeFrag, uniforms, renderType: 'forward' } );

	GLP.ECS.addComponent( world, shape, 'material', shapeMat );
	GLP.ECS.addComponent( world, shape, 'geometry', shapeGeo );

	sceneGraph.add( entity, shape );

	/*-------------------------------
		Event
	-------------------------------*/

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;


	eventComponent.onDispose.push( () => {

		sceneGraph.remove( entity, border );
		disposeComponentGeometry( borderGeo );

		sceneGraph.remove( entity, dots );
		disposeComponentGeometry( dotGeo );

	} );

};
