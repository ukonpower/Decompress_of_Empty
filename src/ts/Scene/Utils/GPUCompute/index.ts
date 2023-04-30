import * as GLP from 'glpower';

import quadVert from './shaders/quad.vs';
import { shaderParse } from '../../Systems/RenderSystem/ShaderParser';
import { applyUniforms } from '../Uniforms';

export class GPUCompute {

	private power: GLP.Power;
	private gl: WebGL2RenderingContext;

	public size: GLP.Vector;
	public rt1: GLP.GLPowerFrameBuffer;
	public rt2: GLP.GLPowerFrameBuffer;

	private program: GLP.GLPowerProgram | null;
	private vao: GLP.GLPowerVAO | null;
	private geometry: GLP.Geometry;

	public uniforms: GLP.Uniforms;

	constructor( power: GLP.Power, size: GLP.Vector, shader: string, uniforms:GLP.Uniforms ) {

		this.size = new GLP.Vector().copy( size );

		this.power = power;

		let gl = power.gl;
		this.gl = gl;

		this.rt1 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [ power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA, magFilter: gl.NEAREST, minFilter: gl.NEAREST } ) ] );
		this.rt2 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [ power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA, magFilter: gl.NEAREST, minFilter: gl.NEAREST } ) ] );

		this.rt1.setSize( size.x, size.y );
		this.rt2.setSize( size.x, size.y );

		this.program = null;
		this.vao = null;
		this.geometry = new GLP.PlaneGeometry( 2.0, 2.0 );

		this.uniforms = uniforms;

		this.replaceShader( shader );

	}

	public compute() {

		if ( ! this.program || ! this.vao ) return;

		let tmp = this.rt1;
		this.rt1 = this.rt2;
		this.rt2 = tmp;

		this.gl.viewport( 0, 0, this.size.x, this.size.y );
		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.rt2.getFrameBuffer() );
		this.gl.drawBuffers( this.rt2.textureAttachmentList );

		this.gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
		this.gl.clearDepth( 1.0 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.rt1.textures[ 0 ].activate( 0 );
		this.program.setUniform( 'uBackBuffer', '1i', [ this.rt1.textures[ 0 ].unit ] );
		this.program.setUniform( 'uResolution', '2fv', this.size.getElm( "vec2" ) );

		if ( this.uniforms ) {

			applyUniforms( this.program, this.uniforms, 1 );

		}

		this.gl.disable( this.gl.BLEND );

		this.program.use( () => {

			if ( ! this.program || ! this.vao ) return;

			this.program.uploadUniforms();

			this.vao.use( vao => {

				this.gl.bindVertexArray( vao.getVAO() );

				this.gl.drawElements( this.gl.TRIANGLES, this.geometry.getAttribute( 'index' ).array.length, this.gl.UNSIGNED_SHORT, 0 );

			} );

		} );

		this.gl.flush();

	}

	public replaceShader( shader: string ) {

		if ( this.program ) {

			this.program.dispose();

		}

		shader = shaderParse( shader, {} );

		this.program = this.power.createProgram();
		this.program.setShader( quadVert, shader );

		this.vao = this.program.getVAO()!;

		const position = this.geometry.getAttribute( 'position' );
		this.vao.setAttribute( 'position', this.power.createBuffer().setData( new Float32Array( position.array ) ), position.size );

		const uv = this.geometry.getAttribute( 'uv' );
		this.vao.setAttribute( 'uv', this.power.createBuffer().setData( new Float32Array( uv.array ) ), uv.size );

		const index = this.geometry.getAttribute( 'index' );
		this.vao.setIndex( this.power.createBuffer().setData( new Uint16Array( index.array ), 'ibo' ) );

		return this;

	}

	public dispose() {

	}

}
