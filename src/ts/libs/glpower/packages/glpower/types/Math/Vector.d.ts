import { Matrix, Types } from "..";
export declare type IVector2 = {
    x: number;
    y: number;
};
export declare type IVector3 = IVector2 & {
    z: number;
};
export declare type IVector4 = IVector3 & {
    w: number;
};
export declare class Vector {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    get isVector(): boolean;
    set(x: number, y?: number, z?: number, w?: number): this;
    add(a: number): Vector;
    add(a: Vector | Types.Nullable<IVector4>): Vector;
    sub(a: number): Vector;
    sub(a: Vector | Types.Nullable<IVector4>): Vector;
    multiply(a: number): Vector;
    multiply(a: Vector): Vector;
    divide(a: number): Vector;
    divide(a: Vector): Vector;
    length(): number;
    normalize(): Vector;
    cross(v: Vector | IVector3): this;
    dot(v: Vector | IVector3): number;
    applyMatrix3(mat: Matrix): void;
    applyMatrix4(mat: Matrix): this;
    copy(a: Vector | Types.Nullable<IVector4>): this;
    clone(): Vector;
    getElm(type?: 'vec2' | 'vec3' | 'vec4'): number[];
}
//# sourceMappingURL=Vector.d.ts.map