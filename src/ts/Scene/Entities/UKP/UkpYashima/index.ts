import * as GLP from 'glpower';
import { hotGet, hotUpdate } from '~/ts/Scene/Utils/Hot';

import { ComponentMaterial } from '../../../Component/Material';

import ukpYashima from './shaders/ukpYashima.fs';

export const materialUkpYashima = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = hotGet( "yashima", ukpYashima );

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/ukpYashima.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = hotUpdate( 'yashima', module.default );
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
