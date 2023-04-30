import * as GLP from 'glpower';
import { hotGet, hotUpdate } from '~/ts/Scene/Utils/Hot';

import deco from './shaders/deco.fs';
import { ComponentMaterial } from '../../Component/Material';
import { world } from '~/ts/Globals';
import { ComponentBLidge } from '../../Component';

export const materialDeco = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;

	let bmat = blidgeComponent.object.material;

	let type = bmat.name.split( '_' )[ 1 ];

	let defines: any = {};

	if ( type == 'sessions' ) {

		defines[ "IS_SESSIONS" ] = '';

	}

	if ( bmat.name.indexOf( 'front' ) > - 1 ) {

		defines[ "IS_FRONT" ] = '';

	}

	material.defines = { ...material.defines, ...defines };
	materialDepth = { ...materialDepth, ...defines };


	material.fragmentShader = materialDepth.fragmentShader = hotGet( "deco", deco );

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/deco.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = hotUpdate( 'deco', module.default );
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
