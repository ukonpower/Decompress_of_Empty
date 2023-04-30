import { IVector3 } from "..";
import { Vector } from "./Vector";
export declare type Quat = {
    x: number;
    y: number;
    z: number;
};
export declare type EulerOrder = 'XYZ' | 'XZY' | 'ZYX' | 'YZX';
export declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x?: number, y?: number, z?: number, w?: number): void;
    euler(euler: Vector | IVector3, order?: EulerOrder): this;
    multiply(): void;
}
//# sourceMappingURL=Quaternion.d.ts.map