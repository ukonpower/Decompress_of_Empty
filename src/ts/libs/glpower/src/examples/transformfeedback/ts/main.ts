import * as GLP from 'glpower';

import transformFeedbackVert1 from './shaders/transformFeedback1.vs';
import transformFeedbackVert2 from './shaders/transformFeedback2.vs';
import transformFeedbackFrag from './shaders/transformFeedback.fs';

class ExTransformFeedback {

	// contexts

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private power: GLP.Power;

	constructor( canvas: HTMLCanvasElement, gl: WebGL2RenderingContext ) {

		this.canvas = canvas;
		this.gl = gl;
		this.power = new GLP.Power( this.gl );

		const num = 20;

		const buffer1Data = [];
		const buffer2Data = [];

		for ( let i = 0; i < num; i ++ ) {

			buffer1Data.push( i );
			buffer2Data.push( 0 );

		}

		const buffer1 = this.power.createBuffer();
		buffer1.setData( new Float32Array( buffer1Data ), 'vbo' );

		const buffer2 = this.power.createBuffer();
		buffer2.setData( new Float32Array( buffer2Data ), 'vbo', this.gl.DYNAMIC_COPY );

		const buffer3 = this.power.createBuffer();
		buffer3.setData( new Float32Array( buffer2Data ), 'vbo', this.gl.DYNAMIC_COPY );

		// tf1

		const transformFeedback1 = new GLP.GLPowerTransformFeedback( this.gl );
		transformFeedback1.setBuffer( "", buffer2, 0 );

		const program = this.power.createProgram();

		transformFeedback1.bind( () => {

			program.setShader( transformFeedbackVert1, transformFeedbackFrag, { transformFeedbackVaryings: [ 'o_value_1' ] } );

		} );

		const vao = program.getVAO();

		const readArray1 = new Float32Array( num );

		if ( vao ) {

			vao.setAttribute( 'value', buffer1, 1 );

			program.use( () => {

				transformFeedback1.use( () => {

					this.gl.beginTransformFeedback( this.gl.POINTS );
					this.gl.enable( this.gl.RASTERIZER_DISCARD );

					vao.use( () => {

						this.gl.drawArrays( this.gl.POINTS, 0, vao.vertCount );

					} );

					this.gl.disable( this.gl.RASTERIZER_DISCARD );
					this.gl.endTransformFeedback();

					this.gl.getBufferSubData( this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, readArray1 );

				} );

			} );

		}

		// tf2

		const transformFeedback2 = new GLP.GLPowerTransformFeedback( this.gl );
		transformFeedback2.setBuffer( "", buffer3, 0 );

		const program2 = this.power.createProgram();

		transformFeedback2.bind( () => {

			program2.setShader( transformFeedbackVert2, transformFeedbackFrag, { transformFeedbackVaryings: [ 'o_value_2' ] } );

		} );

		const vao2 = program2.getVAO();

		const readArray2 = new Float32Array( num );

		if ( vao2 ) {

			vao2.setAttribute( 'value', buffer1, 1 );

			program2.use( () => {

				transformFeedback2.use( () => {

					this.gl.beginTransformFeedback( this.gl.POINTS );
					this.gl.enable( this.gl.RASTERIZER_DISCARD );

					vao2.use( () => {

						this.gl.drawArrays( this.gl.POINTS, 0, vao2.vertCount );

					} );

					this.gl.disable( this.gl.RASTERIZER_DISCARD );
					this.gl.endTransformFeedback();

					this.gl.getBufferSubData( this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, readArray2 );

				} );

			} );

		}

		// dest

		const valueInElm = document.createElement( 'div' );

		valueInElm.innerHTML += 'in: ';

		buffer1Data.forEach( item => {

			valueInElm.innerHTML += item + ', ';

		} );

		document.body.appendChild( valueInElm );

		const valueOutElm = document.createElement( 'div' );

		valueOutElm.innerHTML += 'out1: ';

		readArray1.forEach( item => {

			valueOutElm.innerHTML += item + ', ';

		} );

		document.body.appendChild( valueOutElm );

		const valueOut2Elm = document.createElement( 'div' );

		valueOut2Elm.innerHTML += 'out2: ';

		readArray2.forEach( item => {

			valueOut2Elm.innerHTML += item + ', ';

		} );

		document.body.appendChild( valueOut2Elm );


	}

}

window.addEventListener( 'DOMContentLoaded', () => {

	const canvas = document.querySelector<HTMLCanvasElement>( '#canvas' )!;

	const gl = canvas.getContext( 'webgl2' );

	if ( ! gl ) {

		alert( 'unsupported webgl...' );

		return;

	}

	new ExTransformFeedback( canvas, gl );

} );
