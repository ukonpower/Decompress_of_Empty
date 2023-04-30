import * as GLP from 'glpower';
import { ComponentMaterial } from './Material';

/*-------------------------------
	Object
-------------------------------*/

export type ComponentState = {
	visible: boolean
}

export type ComponentMatrix = {
	local: GLP.Matrix;
	world: GLP.Matrix;
}

export type ComponentSceneNode = {
	parent?: GLP.Entity;
	children: GLP.Entity[];
}

type ComponentGeometryAttribute = Omit<GLP.AttributeBuffer, 'count'>;

export type ComponentGeometry = {
	attributes: ( { name: string } & ComponentGeometryAttribute )[]
	index?: ComponentGeometryAttribute
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

export type PostProcessPass = ( ComponentMaterial & {
	input: GLP.GLPowerTexture[];
	renderTarget: GLP.GLPowerFrameBuffer | null;
	customGeometry?: ComponentGeometry;
	camera?: GLP.Entity
} )

export type ComponentPostProcess = PostProcessPass[]

/*-------------------------------
	BLidge
-------------------------------*/

export type ComponentBLidge = {
	updateTime?: number,
	object: GLP.BLidgeObject,
	uniforms: GLP.Uniforms
}

/*-------------------------------
	Event
-------------------------------*/

export type ComponentEvents = {
	inited?: boolean
	onUpdate: ( ( event: { time: number, deltaTime: number} ) => void )[];
	onResize: ( ( event: { size: GLP.Vector } ) => void )[];
	onBeforeCalcMatrix: ( ( event: { time: number, deltaTime: number} ) => void )[];
	onAfterCalcMatrix: ( ( event: { time: number, deltaTime: number} ) => void )[];
	onUpdateBlidgeFrame: ( ( blidge: GLP.BLidge, blidgeObject: GLP.BLidgeObject ) => void )[];
	onUpdateBlidgeScene: ( ( blidge: GLP.BLidge, blidgeObject: GLP.BLidgeObject ) => void )[];
	onDispose: ( () => void )[]
}

/*-------------------------------
	CameraTrackTo
-------------------------------*/

export type ComponentLookAt = {
	target?: GLP.Entity,
	enable?: boolean
}
