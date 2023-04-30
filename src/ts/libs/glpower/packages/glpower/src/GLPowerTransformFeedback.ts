import { GLPowerBuffer } from "./GLPowerBuffer";

export class GLPowerTransformFeedback {

	private gl: WebGL2RenderingContext;
	private transformFeedback: WebGLTransformFeedback | null;

	protected feedbackBuffer: Map<string, {buffer: GLPowerBuffer, varyingIndex: number}>;

	constructor( gl: WebGL2RenderingContext ) {

		this.gl = gl;
		this.transformFeedback = this.gl.createTransformFeedback();

		this.feedbackBuffer = new Map();

	}

	public bind( cb?: () => void ) {

		this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, this.transformFeedback );

		if ( cb ) cb();

		this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, null );

	}

	public setBuffer( name: string, buffer: GLPowerBuffer, varyingIndex: number ) {

		this.feedbackBuffer.set( name, {
			buffer,
			varyingIndex
		} );

	}

	public use( cb?: ( tf: GLPowerTransformFeedback ) => void ) {

		this.bind( () => {

			this.feedbackBuffer.forEach( fbBuffer => {

				this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, fbBuffer.varyingIndex, fbBuffer.buffer.buffer );

			} );

			if ( cb ) cb( this );

			this.feedbackBuffer.forEach( fbBuffer => {

				this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, fbBuffer.varyingIndex, null );

			} );

		} );

	}

}
