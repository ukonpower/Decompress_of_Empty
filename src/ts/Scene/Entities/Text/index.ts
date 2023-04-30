import * as GLP from 'glpower';
import { world, globalUniforms, gl, power, sceneGraph, blidge } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents, ComponentGeometry, ComponentState } from '../../Component';

import textData from './font/BebasNeue-Regular.json';
import png from './font/BebasNeue-Regular.png';

import { ComponentMaterial, getBaseMaterial } from '../../Component/Material';
import { appendEmpty } from '../Common';

import textVert from './shaders/text.vs';
import textFrag from './shaders/text.fs';
import { disposeComponentGeometry, disposeComponentMaterial } from '../../Utils/Disposer';

let texture = new GLP.GLPowerTexture( gl ).load( png ).setting( { minFilter: gl.LINEAR, magFilter: gl.LINEAR } );

export const text = ( entity: GLP.Entity, text: string, opt?:{defines?: any, uniforms?: GLP.Uniforms} ) => {

	const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' );

	const uniforms = GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.resolution, blidgeComponent ? blidgeComponent.uniforms : {}, opt && opt.uniforms || {} );

	/*-------------------------------
		Text
	-------------------------------*/

	const charList: {
		entity: GLP.Entity,
		material: ComponentMaterial
		materialDepth: ComponentMaterial,
		geometry: ComponentGeometry,
		state: ComponentState,
	}[] = [];
	let px = 0;

	for ( let i = 0; i < text.length; i ++ ) {

		let targetChar = text.charAt( i ).toUpperCase();

		if ( targetChar == '-' || targetChar == ' ' ) {

			px += 0.2;

			continue;

		}

		let c = textData.chars.find( item => item.char == targetChar );

		if ( c ) {

			let uvLeft: number, uvTop: number;
			let uvWidth: number, uvHeight: number;
			let planeSize = new GLP.Vector( 1.0, 1 );
			planeSize.x = planeSize.y * c.width / c.height;

			uvLeft = c.x / textData.common.scaleW;
			uvTop = c.y / textData.common.scaleH;

			uvWidth = c.width / textData.common.scaleW;
			uvHeight = c.height / textData.common.scaleH;

			// geometry

			const geometry = new GLP.PlaneGeometry( planeSize.x, planeSize.y ).getComponent( power );

			// material

			let cUniform = GLP.UniformsUtils.merge( uniforms, {
				uChar: {
					value: new GLP.Vector( uvLeft, uvTop, uvWidth, uvHeight ),
					type: '4fv'
				},
				uTex: {
					value: texture,
					type: '1i'
				}
			} );

			let defines: any = {};

			if ( blidgeComponent ) {

				let bmat = blidgeComponent.object.material;
				let type = bmat.name.split( '_' )[ 0 ];
				let isFront = bmat.name.split( '_' )[ 1 ] == 'front';

				if ( type == 'sessions' ) {

					defines[ "IS_SESSIONS" ] = '';

				}

				if ( type == 'emit' ) {

					defines[ "IS_EMISSION" ] = '';

				}

				if ( type == 'blk' ) {

					defines[ "IS_BLK" ] = '';

				}

				if ( type == 'border' ) {

					defines[ "IS_BORDER" ] = '';

				}

				if ( type == 'imagination' ) {

					defines[ "IS_IMAGINATION" ] = '';

				}

				if ( isFront ) {

					defines[ "IS_FRONT" ] = '';

				}

			}

			if ( opt && opt.defines ) {

				defines = { ...defines, ...opt.defines };

			}


			const { material, materialDepth } = getBaseMaterial( {
				vertexShader: textVert,
				fragmentShader: textFrag,
				uniforms: cUniform,
				renderType: 'deferred',
				defines
			} );

			// entity

			const char = GLP.ECS.createEntity( world );

			px += planeSize.x / 2;

			appendEmpty( char, {
				position: { x: px, y: 0, z: 0 }
			} );

			px += planeSize.x / 2;

			GLP.ECS.addComponent( world, char, 'material', material );
			GLP.ECS.addComponent( world, char, 'materialDepth', materialDepth );
			GLP.ECS.addComponent( world, char, 'geometry', geometry );

			sceneGraph.add( entity, char );

			charList.push( {
				entity: char,
				material,
				materialDepth,
				geometry: geometry,
				state: GLP.ECS.getComponent( world, char, 'state' )!
			} );

		}

	}

	/*-------------------------------
		Event
	-------------------------------*/

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;
	const stateComponent = GLP.ECS.getComponent<ComponentState>( world, entity, 'state' )!;

	eventComponent.onUpdate.push( () => {

		for ( let i = 0; i < charList.length; i ++ ) {

			charList[ i ].state.visible = stateComponent.visible;

		}

	} );

	eventComponent.onDispose.push( () => {

		charList.forEach( item => {

			sceneGraph.remove( entity, item.entity );
			disposeComponentGeometry( item.geometry );
			disposeComponentMaterial( item.material );
			disposeComponentMaterial( item.materialDepth );
			GLP.ECS.removeEntity( world, item.entity );

		} );

	} );

	return { entity, uniforms };

};
