import * as GLP from 'glpower';

import basicVert from '../../shaders/basic.vs';
import textureFrag from '../../shaders/texture.fs';

class ExTexture {

	// contexts

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private power: GLP.Power;
	private projectionMatrix: GLP.Matrix;

	constructor( canvas: HTMLCanvasElement, gl: WebGL2RenderingContext ) {

		this.canvas = canvas;
		this.gl = gl;
		this.power = new GLP.Power( this.gl );

		// scene

		this.projectionMatrix = new GLP.Matrix();

		const cameraMatrix = new GLP.Matrix().setFromTransform(
			new GLP.Vector( 0.0, 0.0, 5.0 ),
			new GLP.Quaternion(),
			new GLP.Vector( 1.0, 1.0, 1.0 ),
		);

		const modelMatrix = new GLP.Matrix().applyPosition( new GLP.Vector( 0, 0, 0 ) );

		const viewMatrix = cameraMatrix.clone().inverse();

		// texture

		const texture = this.power.createTexture();

		texture.load( BASE_PATH + "/assets/lenna.jpg" );

		// program

		const program = this.power.createProgram();
		program.setShader( basicVert, textureFrag );

		// create vao

		const geometry = new GLP.PlaneGeometry( 1.4, 1.4 );

		const vao = program.getVAO()!;

		const position = geometry.getAttribute( 'position' );
		vao.setAttribute( 'position', this.power.createBuffer().setData( new Float32Array( position.array ) ), position.size );

		const uv = geometry.getAttribute( 'uv' );
		vao.setAttribute( 'uv', this.power.createBuffer().setData( new Float32Array( uv.array ) ), uv.size );

		const index = geometry.getAttribute( 'index' );
		vao.setIndex( this.power.createBuffer().setData( new Uint16Array( index.array ), 'ibo' ) );

		// animate

		const animate = () => {

			this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

			gl.enable( gl.DEPTH_TEST );

			modelMatrix.multiply( new GLP.Matrix().applyQuaternion( new GLP.Quaternion().setFromEuler( new GLP.Vector( 0.0, 0.01, 0.0 ) ) ) );
			const modelViewMatrix = viewMatrix.clone().multiply( modelMatrix );

			program.setUniform( 'modelViewMatrix', 'Matrix4fv', modelViewMatrix.elm );
			program.setUniform( 'projectionMatrix', 'Matrix4fv', this.projectionMatrix.elm );

			texture.activate( 0 );
			program.setUniform( 'uTexture', '1i', [ texture.unit ] );

			program.use( () => {

				program.uploadUniforms();

				vao.use( vao => {

					this.gl.bindVertexArray( vao.getVAO() );

					this.gl.drawElements( this.gl.TRIANGLES, geometry.getAttribute( 'index' ).array.length, gl.UNSIGNED_SHORT, 0 );

				} );

			} );

			this.gl.flush();

			window.requestAnimationFrame( animate );

		};

		animate();

		// events

		window.addEventListener( 'resize', this.resize.bind( this ) );
		this.resize();


	}

	private resize() {

		this.projectionMatrix.perspective( 50, window.innerWidth / window.innerHeight, 0.01, 1000 );

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

	}

}

window.addEventListener( 'DOMContentLoaded', () => {

	const canvas = document.querySelector<HTMLCanvasElement>( '#canvas' )!;

	const gl = canvas.getContext( 'webgl2' );

	if ( ! gl ) {

		alert( 'unsupported webgl...' );

		return;

	}

	new ExTexture( canvas, gl );

} );
