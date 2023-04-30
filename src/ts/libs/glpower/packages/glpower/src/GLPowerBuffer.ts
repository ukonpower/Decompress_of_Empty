export type BufferType = 'vbo' | 'ibo';
export type TArrayBuffer = Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array

export class GLPowerBuffer {

	private gl: WebGL2RenderingContext;
	public buffer: WebGLBuffer | null;
	public array: TArrayBuffer | null;

	constructor( gl: WebGL2RenderingContext ) {

		this.gl = gl;

		this.buffer = this.gl.createBuffer();

		this.array = null;

	}

	public setData( data: TArrayBuffer, type: BufferType = 'vbo', usage?: number ) {

		const target = type == 'vbo' ? this.gl.ARRAY_BUFFER : this.gl.ELEMENT_ARRAY_BUFFER;

		this.gl.bindBuffer( target, this.buffer );

		this.gl.bufferData( target, data, usage || this.gl.STATIC_DRAW );

		this.gl.bindBuffer( target, null );

		this.array = data;

		return this;

	}

	public dispose() {

		this.gl.deleteBuffer( this.buffer );

	}

}
