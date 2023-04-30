import * as GLP from 'glpower';

import musicVert from './shaders/music.vs';
import musicFrag from './shaders/music.fs';

const BUFFER_LENGTH = 4096;
const MUSIC_DURATION = 30;

export class Music {

	private power: GLP.Power;
	private gl: WebGL2RenderingContext;

	private audioCtx: AudioContext;
	private audioBuffer: AudioBuffer;
	private node: AudioBufferSourceNode | null;

	private playStartTime: number = - 1;

	constructor( power: GLP.Power ) {

		this.power = power;
		this.gl = this.power.gl;

		this.node = null;

		/*-------------------------------
			Audio
		-------------------------------*/

		this.audioCtx = new AudioContext();

		const bufferLength = this.audioCtx.sampleRate * MUSIC_DURATION;

		// buffer

		this.audioBuffer = this.audioCtx.createBuffer( 2, bufferLength, this.audioCtx.sampleRate );

		const bufferIn = this.power.createBuffer();
		bufferIn.setData( new Float32Array( new Array( bufferLength ).fill( 0 ).map( ( _, i ) => i ) ), 'vbo' );

		const bufferL = this.power.createBuffer();
		bufferL.setData( new Float32Array( bufferLength ), 'vbo', this.gl.DYNAMIC_COPY );

		const bufferR = this.power.createBuffer();
		bufferR.setData( new Float32Array( bufferLength ), 'vbo', this.gl.DYNAMIC_COPY );

		// render

		const program = this.power.createProgram();

		const tf = new GLP.GLPowerTransformFeedback( this.gl );

		tf.setBuffer( "left", bufferL, 0 );
		tf.setBuffer( "right", bufferR, 1 );

		tf.bind( () => {

			program.setShader( musicVert, musicFrag, { transformFeedbackVaryings: [ 'o_left', 'o_right' ] } );

		} );

		program.setUniform( 'uDuration', '1f', [ MUSIC_DURATION ] );
		program.setUniform( 'uSampleRate', '1f', [ this.audioCtx.sampleRate ] );

		const vao = program.getVAO();

		if ( vao ) {

			vao.setAttribute( 'offsetTime', bufferIn, 1 );

			program.use( () => {

				program.uploadUniforms();

				tf.use( () => {

					this.gl.beginTransformFeedback( this.gl.POINTS );
					this.gl.enable( this.gl.RASTERIZER_DISCARD );

					vao.use( () => {

						this.gl.drawArrays( this.gl.POINTS, 0, vao.vertCount );

					} );

					this.gl.disable( this.gl.RASTERIZER_DISCARD );
					this.gl.endTransformFeedback();

				} );

				this.gl.bindBuffer( this.gl.ARRAY_BUFFER, bufferL.buffer );
				this.gl.getBufferSubData( this.gl.ARRAY_BUFFER, 0, this.audioBuffer.getChannelData( 0 ) );

				this.gl.bindBuffer( this.gl.ARRAY_BUFFER, bufferR.buffer );
				this.gl.getBufferSubData( this.gl.ARRAY_BUFFER, 0, this.audioBuffer.getChannelData( 1 ) );

			} );

		}

		// btn

		const btn = document.createElement( 'button' );
		btn.innerHTML = 'sound';
		btn.style.position = 'absolute';
		btn.style.left = '0';
		btn.style.top = '0';
		document.body.appendChild( btn );

		btn.addEventListener( 'click', () => {

			this.play();
			this.stop();

		} );

	}

	public play( time: number = 0 ) {

		if ( this.node ) {

			if ( Math.abs( ( this.node.context.currentTime - this.playStartTime ) - time ) < 0.1 ) return;

		}

		this.stop();

		this.node = this.audioCtx.createBufferSource();
		this.node.connect( this.audioCtx.destination );
		this.node.buffer = this.audioBuffer;
		this.node.loop = false;
		this.node.start( 0, time );

		this.playStartTime = this.node.context.currentTime - ( time || 0 );

	}

	public stop() {

		if ( this.node ) {

			this.node.stop();
			this.node.disconnect( this.audioCtx.destination );
			this.node = null;

		}

	}

}
