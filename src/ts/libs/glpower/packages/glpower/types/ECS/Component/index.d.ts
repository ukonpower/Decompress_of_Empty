import { IVector2, IVector3, IVector4 } from "../../Math/Vector";
export interface Component {
    [key: string]: any;
}
export declare type ComponentName = 'position' | 'scale' | 'matrix' | 'sceneNode' | 'events' | 'camera' | 'perspective' | "orthographic" | "renderCameraDeferred" | "renderCameraForward" | "renderCameraShadowMap" | 'postprocess' | 'material' | 'materialDepth' | 'geometry' | 'directionalLight' | 'pointLight' | 'blidge' | (string & {});
export declare type ComponentVector2 = {} & IVector2;
export declare type ComponentVector3 = {} & IVector3;
export declare type ComponentVector4 = {} & IVector4;
//# sourceMappingURL=index.d.ts.map