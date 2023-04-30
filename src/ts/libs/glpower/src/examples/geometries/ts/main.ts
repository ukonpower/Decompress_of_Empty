import * as GLP from 'glpower';

import basicVert from '../../shaders/basic.vs';
import basicFrag from '../../shaders/basic.fs';

class ExGeometries {

	// contexts

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private core: GLP.Power;
	private projectionMatrix: GLP.Matrix;

	private objList: {
		modelMatrix: GLP.Matrix;
		geometry: GLP.Geometry;
		vao: GLP.GLPowerVAO;
	}[] = [];

	constructor( canvas: HTMLCanvasElement, gl: WebGL2RenderingContext ) {

		this.canvas = canvas;
		this.gl = gl;
		this.core = new GLP.Power( this.gl );

		// scene

		this.projectionMatrix = new GLP.Matrix();

		const cameraMatrix = new GLP.Matrix().setFromTransform(
			new GLP.Vector( 0.0, 0.0, 5.0 ),
			new GLP.Quaternion(),
			new GLP.Vector( 1.0, 1.0, 1.0 ),
		);

		const viewMatrix = cameraMatrix.clone().inverse();

		// program

		const geometries = [
			new GLP.PlaneGeometry(),
			new GLP.CubeGeometry(),
			new GLP.SphereGeometry(),
			new GLP.CylinderGeometry(),
		];

		const program = this.core.createProgram();
		program.setShader( basicVert, basicFrag );

		geometries.forEach( ( geometry, i ) => {

			const vao = program.getVAO( i.toString() )!;

			const position = geometry.getAttribute( 'position' );
			vao.setAttribute( 'position', this.core.createBuffer().setData( new Float32Array( position.array ) ), position.size );

			const uv = geometry.getAttribute( 'uv' );
			vao.setAttribute( 'uv', this.core.createBuffer().setData( new Float32Array( uv.array ) ), uv.size );

			const index = geometry.getAttribute( 'index' );
			vao.setIndex( this.core.createBuffer().setData( new Uint16Array( index.array ), 'ibo' ) );

			const modelMatrix = new GLP.Matrix().applyPosition( new GLP.Vector( ( i / ( geometries.length - 1.0 ) - 0.5 ) * 5.0, 0, 0 ) );

			this.objList.push( {
				modelMatrix,
				geometry,
				vao: vao,
			} );

		} );

		// animate

		const animate = () => {

			this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

			gl.enable( gl.DEPTH_TEST );

			this.objList.forEach( ( obj ) => {

				const modelMatrix = obj.modelMatrix;

				modelMatrix.multiply( new GLP.Matrix().applyQuaternion( new GLP.Quaternion().setFromEuler( new GLP.Vector( 0.0, 0.01, 0.0 ) ) ) );

				const modelViewMatrix = viewMatrix.clone().multiply( modelMatrix );
				program.setUniform( 'modelViewMatrix', 'Matrix4fv', modelViewMatrix.elm );
				program.setUniform( 'projectionMatrix', 'Matrix4fv', this.projectionMatrix.elm );

				program.use( ( program ) => {

					program.uploadUniforms();

					obj.vao.use( ( vao ) => {

						this.gl.drawElements( this.gl.TRIANGLES, vao.indexCount, gl.UNSIGNED_SHORT, 0 );

					} );


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

	new ExGeometries( canvas, gl );

} );
