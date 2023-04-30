import { IVector2, IVector3, IVector4 } from "../../Math/Vector";

export interface Component {[key:string]: any}

export type ComponentName =
	'position' |
	'scale' |
	'matrix' |
	'sceneNode' |
	'events' |
	'camera' |
	'perspective' |
	"orthographic" |
	"renderCameraDeferred" |
	"renderCameraForward" |
	"renderCameraShadowMap" |
	'postprocess' |
	'material' |
	'materialDepth' |
	'geometry' |
	'directionalLight' |
	'pointLight' |
	'blidge' |
	( string & {} );

/*-------------------------------
	Math
-------------------------------*/

export type ComponentVector2 = {
} & IVector2

export type ComponentVector3 = {
} & IVector3

export type ComponentVector4 = {
} & IVector4
