import * as GLP from 'glpower';
import { Uniforms } from 'glpower';

/*-------------------------------
	Object
-------------------------------*/

export type ComponentTransformMatrix = {
	local: GLP.Matrix;
	world: GLP.Matrix;
}

export type ComponentSceneNode = {
	parent?: GLP.Entity;
	children: GLP.Entity[];
}

/*-------------------------------
	Mesh
-------------------------------*/

export type RenderType = 'forward' | 'deferred' | 'shadowMap' | 'postprocess';

export type ComponentMaterial = {
	vertexShader: string;
	fragmentShader: string;
	uniforms?: Uniforms;
	renderType?: RenderType;
	defines?: {[key: string]: string}
	needsUpdate?: boolean;
	__program?: GLP.GLPowerProgram
}

export type ComponentGeometry = {
	attributes: ( {name: string } & GLP.AttributeBuffer )[]
	index: GLP.AttributeBuffer
	needsUpdate?: Map<GLP.GLPowerVAO, boolean>
}

/*-------------------------------
	Camera
-------------------------------*/

export type ComponentCamera = {
	near: number;
	far: number;
	aspectRatio: number;
	projectionMatrix: GLP.Matrix,
	viewMatrix: GLP.Matrix,
	needsUpdate?: boolean;
}

export type ComponentCameraPerspective = {
	fov: number;
}

export type ComponentCameraOrthographic = {
	width: number,
	height: number,
}

export type ComponentRenderCamera = {
	renderTarget: GLP.GLPowerFrameBuffer | null;
	postprocess?: ComponentPostProcess
}

export type ComponentShadowmapCamera = {
	renderTarget: GLP.GLPowerFrameBuffer,
}

/*-------------------------------
	Light
-------------------------------*/

export type ComponentLightDirectional = {
	color: GLP.IVector3,
	intensity: number
}

export type ComponentLightSpot = {
	color: GLP.IVector3,
	intensity: number,
	angle: number,
	blend: number,
	distance: number,
	decay: number,
}

/*-------------------------------
	PostProcess
-------------------------------*/

export type ComponentPostProcess = ( ComponentMaterial & {
	input: GLP.GLPowerTexture[];
	renderTarget: GLP.GLPowerFrameBuffer | null;
	customGeometry?: ComponentGeometry;
	camera?: GLP.Entity
} )[]

/*-------------------------------
	BLidge
-------------------------------*/

export type ComponentBLidge = {
	name: string
	type: GLP.BLidgeObjectType
	updateTime?: number,
	curveGroups?: {
		position?: GLP.FCurveGroup;
		rotation?: GLP.FCurveGroup;
		scale?:GLP. FCurveGroup;
		uniforms?: {name: string, curve: GLP.FCurveGroup }[]
	},
}

/*-------------------------------
	Event
-------------------------------*/

export type ComponentEvents = {
	inited?: boolean
	onUpdate?: ( event: { time: number, deltaTime: number} ) => void,
	onResize?: ( event: { size: GLP.Vector } ) => void,
}
