import { GLPowerTexture } from "./GLPowerTexture";
import { Vector } from "./Math/Vector";
export declare class GLPowerFrameBuffer {
    size: Vector;
    private gl;
    private frameBuffer;
    private depthRenderBuffer;
    textures: GLPowerTexture[];
    textureAttachmentList: number[];
    constructor(gl: WebGL2RenderingContext);
    setTexture(textures: GLPowerTexture[]): this;
    setSize(size: Vector): void;
    setSize(width: number, height: number): void;
    getFrameBuffer(): WebGLFramebuffer | null;
}
//# sourceMappingURL=GLPowerFrameBuffer.d.ts.map