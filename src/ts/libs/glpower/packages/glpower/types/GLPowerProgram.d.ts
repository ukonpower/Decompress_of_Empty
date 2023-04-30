import { Matrix } from "./Math/Matrix";
import { Vector } from "./Math/Vector";
import { GLPowerVAO } from "./GLPowerVAO";
import { GLPowerTexture } from ".";
export declare type Uniformable = boolean | number | Vector | Matrix | GLPowerTexture;
export declare type UniformType = '1f' | '1fv' | '2f' | '2fv' | '3f' | '3fv' | '4f' | '4fv' | '1i' | '1iv' | '2i' | '2iv' | '3i' | '3iv' | '4i' | '4iv' | 'Matrix2fv' | 'Matrix3fv' | 'Matrix4fv';
export declare type Uniform = {
    location: WebGLUniformLocation | null;
    value: (number | boolean)[];
    type: string;
    cache?: (number | boolean)[];
    needsUpdate?: boolean;
};
export declare type Uniforms = {
    [key: string]: {
        value: Uniformable | Uniformable[];
        type: UniformType;
    };
};
export declare type ShaderOptions = {
    transformFeedbackVaryings?: string[];
};
export declare class GLPowerProgram {
    gl: WebGL2RenderingContext;
    program: WebGLProgram | null;
    private vao;
    protected uniforms: Map<string, Uniform>;
    constructor(gl: WebGL2RenderingContext);
    setShader(vertexShaderSrc: string, fragmentShaderSrc: string, opt?: ShaderOptions): this | undefined;
    protected createShader(shaderSrc: string, type: number): WebGLShader | null;
    setUniform(name: string, type: UniformType, value: (number | boolean)[]): void;
    private updateUniformLocations;
    uploadUniforms(): void;
    getVAO(id?: string): GLPowerVAO | null;
    use(cb?: (program: GLPowerProgram) => void): void;
    getProgram(): WebGLProgram | null;
}
//# sourceMappingURL=GLPowerProgram.d.ts.map