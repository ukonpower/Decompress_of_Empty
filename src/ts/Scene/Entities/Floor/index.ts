import * as GLP from 'glpower';

import { ComponentMaterial } from '../../Component/Material';
import { hotGet, hotUpdate } from '../../Utils/Hot';

import floorFrag from './shaders/floor.fs';

export const materialFloor = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = floorFrag;

	if ( import.meta.hot ) {

		material.fragmentShader = materialDepth.fragmentShader = hotGet( "floor.fs", floorFrag );

		import.meta.hot.accept( "./shaders/floor.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = hotUpdate( "floor.fs", module.default );
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
