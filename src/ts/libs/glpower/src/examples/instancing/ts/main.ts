import * as GLP from 'glpower';

import instancingVert from '../../shaders/instancing.vs';
import basicFrag from '../../shaders/basic.fs';

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
			new GLP.Vector( 0.0, 0.0, 20.0 ),
			new GLP.Quaternion(),
			new GLP.Vector( 1.0, 1.0, 1.0 ),
		);

		const viewMatrix = cameraMatrix.clone().inverse();

		const modelMatrix = new GLP.Matrix().applyPosition( new GLP.Vector( 0, 0, 0 ) );

		// program

		const program = this.power.createProgram();
		program.setShader( instancingVert, basicFrag );

		// geometry

		const geometry = new GLP.CubeGeometry();

		// vao

		const vao = program.getVAO()!;

		const position = geometry.getAttribute( 'position' );
		vao.setAttribute( 'position', this.power.createBuffer().setData( new Float32Array( position.array ) ), position.size );

		const uv = geometry.getAttribute( 'uv' );
		vao.setAttribute( 'uv', this.power.createBuffer().setData( new Float32Array( uv.array ) ), uv.size );

		const index = geometry.getAttribute( 'index' );
		vao.setIndex( this.power.createBuffer().setData( new Uint16Array( index.array ), 'ibo' ) );

		// instancedAttribute

		const instanceNum = 1000;

		const instancePositionArray = [];

		for ( let i = 0; i < instanceNum; i ++ ) {

			instancePositionArray.push( ( Math.random() - 0.5 ) * 15.0 );
			instancePositionArray.push( ( Math.random() - 0.5 ) * 15.0 );
			instancePositionArray.push( ( Math.random() - 0.5 ) * 15.0 );

		}

		vao.setAttribute( 'instancePosition', this.power.createBuffer().setData( new Float32Array( instancePositionArray ) ), 3, { instanceDivisor: 1 } );

		// animate

		const startTime = new Date().getTime();

		const animate = () => {

			const time = ( new Date().getTime() - startTime ) / 1000;

			this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

			gl.enable( gl.DEPTH_TEST );

			modelMatrix.multiply( new GLP.Matrix().applyQuaternion( new GLP.Quaternion().setFromEuler( new GLP.Vector( 0.0, 0.003, 0.0 ) ) ) );
			const modelViewMatrix = viewMatrix.clone().multiply( modelMatrix );

			program.setUniform( 'modelViewMatrix', 'Matrix4fv', modelViewMatrix.elm );
			program.setUniform( 'projectionMatrix', 'Matrix4fv', this.projectionMatrix.elm );
			program.setUniform( 'uTime', '1f', [ time ] );

			program.use( () => {

				program.uploadUniforms();

				vao.use( vao => {

					this.gl.bindVertexArray( vao.getVAO() );

					this.gl.drawElementsInstanced( this.gl.TRIANGLES, geometry.getAttribute( 'index' ).array.length, gl.UNSIGNED_SHORT, 0, instanceNum );

				} );

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
