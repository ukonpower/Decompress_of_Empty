import { GLPowerProgram } from "./GLPowerProgram";
import { GLPowerBuffer } from "./GLPowerBuffer";
import { GLPowerTexture } from "./GLPowerTexture";
import { GLPowerFrameBuffer } from "./GLPowerFrameBuffer";
export declare class Power {
    gl: WebGL2RenderingContext;
    constructor(gl: WebGL2RenderingContext);
    createProgram(): GLPowerProgram;
    createBuffer(): GLPowerBuffer;
    createTexture(): GLPowerTexture;
    createFrameBuffer(): GLPowerFrameBuffer;
}
//# sourceMappingURL=Power.d.ts.map