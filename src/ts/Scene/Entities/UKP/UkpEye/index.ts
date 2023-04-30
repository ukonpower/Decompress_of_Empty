import * as GLP from 'glpower';

import { hotGet, hotUpdate } from '~/ts/Scene/Utils/Hot';
import { ComponentMaterial } from '../../../Component/Material';

import ukpEye from './shaders/ukpEye.fs';

export const materialukpEye = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = hotGet( "eye", ukpEye );

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/ukpEye.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = hotUpdate( 'eye', module.default );
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
