import { GLPowerBuffer } from "./GLPowerBuffer";
export declare class GLPowerTransformFeedback {
    private gl;
    private transformFeedback;
    protected feedbackBuffer: Map<string, {
        buffer: GLPowerBuffer;
        varyingIndex: number;
    }>;
    constructor(gl: WebGL2RenderingContext);
    bind(cb?: () => void): void;
    setBuffer(name: string, buffer: GLPowerBuffer, varyingIndex: number): void;
    use(cb?: (tf: GLPowerTransformFeedback) => void): void;
}
//# sourceMappingURL=GLPowerTransformFeedback.d.ts.map