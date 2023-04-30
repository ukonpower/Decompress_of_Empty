import { BufferType } from "../GLPowerBuffer";
import { Power } from "../Power";
import { Attribute, AttributeBuffer } from "../GLPowerVAO";
declare type DefaultAttributeName = 'position' | 'uv' | 'normal' | 'index';
export declare class Geometry {
    count: number;
    attributes: {
        [key: string]: Attribute;
    };
    constructor();
    setAttribute(name: DefaultAttributeName | (string & {}), array: number[], size: number): void;
    getAttribute(name: DefaultAttributeName | (string & {})): Attribute;
    private updateVertCount;
    getAttributeBuffer(core: Power, name: DefaultAttributeName | (string & {}), constructor: Float32ArrayConstructor | Uint16ArrayConstructor, bufferType?: BufferType): AttributeBuffer;
    getComponent(power: Power): {
        attributes: {
            buffer: import("../GLPowerBuffer").GLPowerBuffer;
            size: number;
            count: number;
            location?: number | undefined;
            instanceDivisor?: number | undefined;
            name: string;
        }[];
        index: AttributeBuffer;
    };
}
export {};
//# sourceMappingURL=Geometry.d.ts.map