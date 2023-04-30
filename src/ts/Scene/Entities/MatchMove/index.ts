import * as GLP from 'glpower';

import { gBuffer, gl, globalUniforms, power, sceneGraph, world } from '~/ts/Globals';
import { ComponentEvents, ComponentGeometry, ComponentState } from '../../Component';
import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';
import { disposeComponentGeometry, disposeComponentMaterial } from '../../Utils/Disposer';
import { GPUCompute } from '../../Utils/GPUCompute';
import { createEmpty } from '../Common';

import matchMoveVert from './shaders/matchMove.vs';
import matchMoveLineVert from './shaders/matchMoveLine.vs';
import matchMoveFrag from './shaders/matchMove.fs';
import matchMoveCompute from './shaders/matchMoveCompute.glsl';

export const matchMove = ( entity: GLP.Entity ) => {

	const num = new GLP.Vector( 100 + 1, 70 );

	const state = GLP.ECS.getComponent<ComponentState>( world, entity, 'state' )!;

	/*-------------------------------
		Compute
	-------------------------------*/

	const gpu = new GPUCompute( power, num, matchMoveCompute, GLP.UniformsUtils.merge( globalUniforms.camera, globalUniforms.time, {
		uPosGBuffer: {
			value: gBuffer.textures[ 0 ],
			type: "1i"
		}
	} ) );

	const reset = () => {

		let posArray = [];

		gl.bindFramebuffer( gl.FRAMEBUFFER, gBuffer.getFrameBuffer() );

		for ( let i = 0; i < num.y; i ++ ) {

			var dest = new Float32Array( 4 );

			gl.readPixels( Math.random() * gBuffer.size.x, Math.random() * gBuffer.size.y, 1, 1, gl.RGBA, gl.FLOAT, dest );

			posArray.push( dest );

		}

		for ( let i = 0; i < num.y; i ++ ) {

			const x = 0;
			const y = i;

			gl.bindTexture( gl.TEXTURE_2D, gpu.rt2.textures[ 0 ].getTexture() );
			gl.texSubImage2D( gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, posArray[ i ] );
			gl.bindFramebuffer( gl.FRAMEBUFFER, null );

		}

	};

	setTimeout( () => {

		reset();

	}, 100 );

	/*-------------------------------
		Marker
	-------------------------------*/

	// geometry

	let markerGeometry = new GLP.Geometry();

	markerGeometry.setAttribute( 'position', [
		- 0.5, 0.5, 0.0,
		0.5, 0.5, 0.0,
		0.5, - 0.5, 0.0,
		- 0.5, - 0.5, 0.0,

		0.0, - 0.05, 0.0,
		0.2, - 0.2, 0.0,
		- 0.2, - 0.2, 0.0,

		0.0, 0.05, 0.0,
		0.2, 0.2, 0.0,
		- 0.2, 0.2, 0.0,
	], 3 );

	markerGeometry.setAttribute( 'index', [
		0, 1,
		1, 2,
		2, 3,
		3, 0,

		4, 5,
		4, 6,

		7, 8,
		7, 9,
	], 1 );

	let markerGeometryComponent = markerGeometry.getComponent( power );

	const idArray = [];

	for ( let i = 0; i < num.y; i ++ ) {

		idArray.push( i / num.y, 0.0, 0.0 );

	}

	markerGeometryComponent.attributes.push( {
		name: "id",
		size: 3,
		buffer: new GLP.GLPowerBuffer( gl ).setData( new Float32Array( idArray ) ),
		instanceDivisor: 1
	} );

	GLP.ECS.addComponent<ComponentGeometry>( world, entity, 'geometry', markerGeometryComponent );

	// material

	let uniforms = GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.beat, globalUniforms.resolution, {
		uComBuf: {
			value: 0,
			type: '1i',
		},
		uComputeSize: {
			value: gpu.size,
			type: '2fv'
		}
	} );

	const { material: markerMaterial } = getBaseMaterial( {
		name: 'matchMove/marker',
		vertexShader: matchMoveVert,
		fragmentShader: matchMoveFrag,
		uniforms,
		renderType: 'forward',
		blending: "add",
		drawType: gl.LINES,
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', markerMaterial );

	/*-------------------------------
		Line
	-------------------------------*/

	let line = createEmpty();

	const lineState = GLP.ECS.getComponent<ComponentState>( world, line, 'state' )!;

	// geometry

	const lineUVArray = [];
	const lineidArray = [];
	const lineIndexArray = [];

	for ( let i = 0; i < ( num.x - 1 ); i ++ ) {

		lineUVArray.push( ( i + 1 ) / ( num.x - 1 ), 0 );

		if ( i < num.x - 2 ) {

			lineIndexArray.push( i, i + 1 );

		}

	}

	for ( let i = 0; i < num.y; i ++ ) {

		lineidArray.push( i / num.y );

	}

	let lineGeometryComponent: ComponentGeometry = {
		attributes: [
			{
				name: 'uv',
				buffer: power.createBuffer().setData( new Float32Array( lineUVArray ) ),
				size: 2,
			},
			{
				name: 'id',
				buffer: power.createBuffer().setData( new Float32Array( idArray ) ),
				size: 1,
				instanceDivisor: 1
			},
		],
		index: {
			buffer: power.createBuffer().setData( new Uint16Array( lineIndexArray ), 'ibo' ),
			size: 1,
		}
	};

	GLP.ECS.addComponent( world, line, 'geometry', lineGeometryComponent );

	// material

	const { material: lineMaterial } = getBaseMaterial( {
		name: "matchMove/line",
		vertexShader: matchMoveLineVert,
		fragmentShader: matchMoveFrag,
		renderType: 'forward',
		drawType: gl.LINES,
		blending: "add",
		uniforms,
	} );

	GLP.ECS.addComponent<ComponentMaterial>( world, line, 'material', lineMaterial );

	sceneGraph.add( entity, line );

	/*-------------------------------
		Events
	-------------------------------*/

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onUpdate.push( ( e ) => {

		gpu.compute();

		uniforms.uComBuf.value = gpu.rt1.textures[ 0 ];

		lineState.visible = state.visible;

	} );

	eventComponent.onDispose.push( () => {

		gpu.dispose();

		sceneGraph.remove( entity, line );
		GLP.ECS.removeEntity( world, line );

		disposeComponentGeometry( markerGeometryComponent );
		disposeComponentMaterial( markerMaterial );

		disposeComponentGeometry( lineGeometryComponent );
		disposeComponentMaterial( lineMaterial );

	} );

	if ( import.meta.hot ) {

		import.meta.hot.accept( [ "./shaders/matchMove.vs", "./shaders/matchMove.fs" ], ( module ) => {

			if ( module[ 0 ] ) {

				markerMaterial.vertexShader = module[ 0 ].default;

			}

			if ( module[ 1 ] ) {

				lineMaterial.fragmentShader = markerMaterial.fragmentShader = module[ 1 ].default;

			}

			markerMaterial.needsUpdate = true;
			lineMaterial.needsUpdate = true;

		} );

		import.meta.hot.accept( "./shaders/matchMoveLine.vs", ( module ) => {

			if ( module ) {

				lineMaterial.vertexShader = module.default;
				lineMaterial.needsUpdate = true;

			}

		} );

	}



};
