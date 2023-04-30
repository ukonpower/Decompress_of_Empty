import * as GLP from 'glpower';
import { globalUniforms } from '~/ts/Globals';

import basicVert from '~/ts/shaders/basic.vs';
import deferredMaterialFrag from '~/ts/shaders/deferredMaterial.fs';

/*-------------------------------
	Mesh
-------------------------------*/

export type RenderType = 'forward' | 'deferred' | 'shadowMap' | 'postprocess';

export type ComponentMaterial = {
	name?: string
	vertexShader: string;
	fragmentShader: string;
	useLight?: boolean;
	uniforms?: GLP.Uniforms;
	renderType?: RenderType;
	defines?: {[key: string]: string}
	needsUpdate?: boolean;
	drawType?: number,
	blending?: "normal" | 'add',
	__program?: GLP.GLPowerProgram
}

export const getBaseMaterial = ( opt?:GLP.Types.Nullable<ComponentMaterial> ) =>{

	const material: ComponentMaterial | null = {
		vertexShader: basicVert,
		fragmentShader: deferredMaterialFrag,
		renderType: 'deferred',
		...opt,
		uniforms: GLP.UniformsUtils.merge( opt && opt.uniforms, globalUniforms.time, globalUniforms.beat ),
	};

	const materialDepth: ComponentMaterial = { ...material, defines: { ...material.defines, IS_DEPTH: '' }, renderType: 'shadowMap' };

	return { material, materialDepth };

};
