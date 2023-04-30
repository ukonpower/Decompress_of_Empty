import * as GLP from 'glpower';

import basicVert from '../../shaders/basic.vs';
import basicFrag from '../../shaders/basic.fs';
import textureFrag from '../../shaders/texture.fs';

class ExFrameBuffer {

	// contexts

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private power: GLP.Power;
	private projectionMatrix: GLP.Matrix;

	private objList: {[key:string]: {
		modelMatrix: GLP.Matrix;
		vao: GLP.GLPowerVAO;
		program: GLP.GLPowerProgram
	}};

	constructor( canvas: HTMLCanvasElement, gl: WebGL2RenderingContext ) {

		this.canvas = canvas;
		this.gl = gl;
		this.power = new GLP.Power( this.gl );
		this.objList = {};

		// scene

		this.projectionMatrix = new GLP.Matrix();
		const projectionMatrixFrame = new GLP.Matrix().perspective( 50, 1.0, 0.01, 1000 );

		const cameraMatrix = new GLP.Matrix().setFromTransform(
			new GLP.Vector( 0.0, 0.0, 5.0 ),
			new GLP.Quaternion(),
			new GLP.Vector( 1.0, 1.0, 1.0 ),
		);

		const viewMatrix = cameraMatrix.clone().inverse();

		// frameBuffer

		const frameBuffer = this.power.createFrameBuffer();
		frameBuffer.setSize( 1024, 1024 );

		const texture = this.power.createTexture();

		frameBuffer.setTexture( [
			texture
		] );

		texture.activate( 0 );

		// program

		const basicProgram = this.power.createProgram();
		basicProgram.setShader( basicVert, basicFrag );

		const frameProgram = this.power.createProgram();
		frameProgram.setShader( basicVert, textureFrag );

		// vao

		const setVao = ( vao: GLP.GLPowerVAO, geo: GLP.Geometry ) => {

			const position = geo.getAttribute( 'position' );
			vao.setAttribute( 'position', this.power.createBuffer().setData( new Float32Array( position.array ) ), position.size );

			const uv = geo.getAttribute( 'uv' );
			vao.setAttribute( 'uv', this.power.createBuffer().setData( new Float32Array( uv.array ) ), uv.size );

			const index = geo.getAttribute( 'index' );
			vao.setIndex( this.power.createBuffer().setData( new Uint16Array( index.array ), 'ibo' ) );

			return vao;

		};

		this.objList.cube = {
			modelMatrix: new GLP.Matrix().applyPosition( new GLP.Vector( 0, 0, 0 ) ),
			vao: setVao( basicProgram.getVAO()!, new GLP.CubeGeometry() ),
			program: basicProgram
		};

		this.objList.plane = {
			modelMatrix: new GLP.Matrix().applyPosition( new GLP.Vector( 0, 0, 0 ) ),
			vao: setVao( frameProgram.getVAO()!, new GLP.PlaneGeometry( 2.0, 2.0 ) ),
			program: frameProgram
		};

		// animate

		const animate = () => {

			// cube

			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, frameBuffer.getFrameBuffer() );
			this.gl.viewport( 0, 0, frameBuffer.size.x, frameBuffer.size.y );

			this.gl.clearColor( 0.1, 0.1, 0.1, 1.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
			gl.enable( gl.DEPTH_TEST );

			this.objList.cube.modelMatrix.multiply( new GLP.Matrix().applyQuaternion( new GLP.Quaternion().setFromEuler( new GLP.Vector( 0.0, 0.01, 0.0 ) ) ) );

			this.objList.cube.program.setUniform( 'modelViewMatrix', 'Matrix4fv', viewMatrix.clone().multiply( this.objList.cube.modelMatrix ).elm );
			this.objList.cube.program.setUniform( 'projectionMatrix', 'Matrix4fv', projectionMatrixFrame.elm );

			this.objList.cube.program.use( ( program ) => {

				program.uploadUniforms();

				this.gl.bindVertexArray( this.objList.cube.vao.getVAO() );

				this.gl.drawElements( this.gl.TRIANGLES, this.objList.cube.vao.indexCount, gl.UNSIGNED_SHORT, 0 );

			} );

			// plane

			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
			this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

			this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
			gl.enable( gl.DEPTH_TEST );

			this.objList.plane.modelMatrix.multiply( new GLP.Matrix().applyQuaternion( new GLP.Quaternion().setFromEuler( new GLP.Vector( 0.0, 0.01, 0.0 ) ) ) );

			this.objList.plane.program.setUniform( 'modelViewMatrix', 'Matrix4fv', viewMatrix.clone().multiply( this.objList.plane.modelMatrix ).elm );
			this.objList.plane.program.setUniform( 'projectionMatrix', 'Matrix4fv', this.projectionMatrix.elm );
			this.objList.plane.program.setUniform( 'uTexture', '1i', [ frameBuffer.textures[ 0 ].unit ] );

			this.objList.plane.program.use( ( program ) => {

				program.uploadUniforms();

				this.gl.bindVertexArray( this.objList.plane.vao.getVAO() );

				this.gl.drawElements( this.gl.TRIANGLES, this.objList.plane.vao.indexCount, gl.UNSIGNED_SHORT, 0 );

				this.gl.flush();

			} );


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

	}

}

window.addEventListener( 'DOMContentLoaded', () => {

	const canvas = document.querySelector<HTMLCanvasElement>( '#canvas' )!;

	const gl = canvas.getContext( 'webgl2' );

	if ( ! gl ) {

		alert( 'unsupported webgl...' );

		return;

	}

	new ExFrameBuffer( canvas, gl );

} );
