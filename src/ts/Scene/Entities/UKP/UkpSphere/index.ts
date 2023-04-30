import * as GLP from 'glpower';

import ukpFrag from './shaders/ukpSphere.fs';
import { ComponentMaterial } from '../../../Component/Material';

export const materialUkpSphere = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = ukpFrag;

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/ukpSphere.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = module.default;
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
