import * as GLP from 'glpower';

import roofFrag from './shaders/roof.fs';
import { ComponentMaterial } from '../../Component/Material';

export const materialRoof = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = roofFrag;

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/roof.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = module.default;
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
