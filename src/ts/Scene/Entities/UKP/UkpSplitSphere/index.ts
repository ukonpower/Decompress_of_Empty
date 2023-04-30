import * as GLP from 'glpower';

import ukpFrag from './shaders/ukpSplitSphere.fs';
import { ComponentMaterial } from '../../../Component/Material';

export const materialUkpSplitSpere = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = ukpFrag;

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/ukpSplitSphere.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = module.default;
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
