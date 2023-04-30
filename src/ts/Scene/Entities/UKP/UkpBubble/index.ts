import * as GLP from 'glpower';
import { hotGet, hotUpdate } from '~/ts/Scene/Utils/Hot';

import { ComponentMaterial } from '../../../Component/Material';

import ukpBubble from './shaders/ukpBubble.fs';

export const materialUkpBubble = ( entity: GLP.Entity, material: ComponentMaterial, materialDepth: ComponentMaterial ) => {

	material.fragmentShader = materialDepth.fragmentShader = hotGet( "bubble", ukpBubble );

	if ( import.meta.hot ) {

		import.meta.hot.accept( "./shaders/ukpBubble.fs", ( module ) => {

			if ( module ) {

				material.fragmentShader = materialDepth.fragmentShader = hotUpdate( 'bubble', module.default );
				material.needsUpdate = materialDepth.needsUpdate = true;

			}

		} );

	}

};
