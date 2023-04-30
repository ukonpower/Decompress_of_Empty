import { Geometry } from './Geometry';
export declare class SphereGeometry extends Geometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
    setAttribute(name: ('position' | 'uv' | 'normal' | 'index') | (string & {}), array: number[], size: number): void;
}
//# sourceMappingURL=SphereGeometry.d.ts.map