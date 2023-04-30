import { ComponentGeometry } from "../../Component";
import { ComponentMaterial } from "../../Component/Material";

export const disposeComponentGeometry = ( geometry: ComponentGeometry ) => {

	geometry.attributes.forEach( attr => attr.buffer.dispose );

	if ( geometry.index ) {

		geometry.index.buffer.dispose;

	}

};

export const disposeComponentMaterial = ( material: ComponentMaterial ) => {

	// todo

};
