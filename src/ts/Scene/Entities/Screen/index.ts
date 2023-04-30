import * as GLP from 'glpower';

import screenFrag from '~/ts/shaders/screen.fs';
import { ComponentMaterial } from '../../Component/Material';

export const materialScreen = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = screenFrag;

	if ( import.meta.hot ) {

		import.meta.hot.accept( "~/ts/shaders/screen.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = module.default;
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
