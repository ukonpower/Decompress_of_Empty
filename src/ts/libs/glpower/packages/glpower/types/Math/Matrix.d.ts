import { IVector4 } from "..";
import { Quaternion } from "./Quaternion";
import { IVector3, Vector } from "./Vector";
export declare class Matrix {
    elm: number[];
    constructor(elm?: number[]);
    identity(): this;
    clone(): Matrix;
    copy(mat: Matrix): this;
    perspective(fov: number, aspect: number, near: number, far: number): this;
    orthographic(width: number, height: number, near: number, far: number): this;
    lookAt(eye: Vector, target: Vector, up: Vector): this;
    inverse(): this;
    transpose(): this;
    set(elm: number[]): this;
    setFromTransform(pos: IVector3, qua: Quaternion | IVector4, scale: IVector3): this;
    applyPosition(position: IVector3): this;
    applyQuaternion(q: Quaternion | IVector4): this;
    applyScale(scale: IVector3): this;
    protected matmul(elm2: number[]): void;
    multiply(m: Matrix): this;
    preMultiply(m: Matrix): this;
    copyToArray(array: number[]): number[];
}
//# sourceMappingURL=Matrix.d.ts.map