import * as GLP from 'glpower';
import { hotGet, hotUpdate } from '~/ts/Scene/Utils/Hot';

import { ComponentMaterial } from '../../../Component/Material';

import ukpCore from './shaders/ukpCore.fs';

export const materialUKPCore = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = hotGet( "core", ukpCore );

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/ukpCore.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = hotUpdate( 'core', module.default );
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
