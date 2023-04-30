import * as GLP from 'glpower';
import { Entity, Uniformable } from 'glpower';
import { ComponentCamera, ComponentGeometry, ComponentLightDirectional, ComponentLightSpot, ComponentMaterial, ComponentPostProcess, ComponentRenderCamera, ComponentShadowmapCamera, ComponentTransformMatrix } from '../../Component';
import { ProgramManager } from './ProgramManager';
import { shaderParse } from './ShaderParser';

type Matrix = {
	modelMatrix?: GLP.Matrix,
	viewMatrix: GLP.Matrix,
	projectionMatrix: GLP.Matrix
	cameraMatrix: GLP.Matrix,
	near?: number,
	far?: number
}

export type ShadowMapCamera = {
	viewMatrix: GLP.Matrix,
	projectionMatrix: GLP.Matrix
	near: number,
	far: number,
	texture: GLP.GLPowerTexture,
}

export type Lights = {
	needsUpdate: boolean
	directionalLight: {direction: GLP.Vector, color: GLP.Vector}[],
	directionalLightShadow: ( ShadowMapCamera | null )[]
	spotLight: {position: GLP.Vector, direction: GLP.Vector, color: GLP.Vector, angle: number, blend: number, distance: number, decay: number}[],
	spotLightShadow: ( ShadowMapCamera | null )[]
}

export class RenderSystem extends GLP.System {

	private gl: WebGL2RenderingContext;
	private power: GLP.Power;

	// canvas

	private canvasPixelSize: GLP.Vector;
	private canvasViewSize: GLP.Vector;

	// program

	private programManager: ProgramManager;

	// matrix

	private modelViewMatrix: GLP.Matrix;
	private normalMatrix: GLP.Matrix;

	// tmp

	private textureUnit: number = 0;
	private tmpLightDirection: GLP.Vector;
	private tmpMatrix: GLP.Matrix;

	// quad

	private quad: ComponentGeometry;

	// lights

	private lights: Lights;

	constructor( core: GLP.Power ) {

		super( {
			"directionalLight": [ 'directionalLight', 'position' ],
			"spotLight": [ 'spotLight', 'position' ],
			"shadowMap": [ 'camera', 'renderCameraShadowMap' ],
			"deferred": [ "camera", "renderCameraDeferred" ],
			"forward": [ "camera", "renderCameraForward" ],
			"postprocess": [ 'postprocess' ]
		} );

		this.power = core;
		this.gl = this.power.gl;

		// canvas

		this.canvasPixelSize = new GLP.Vector();
		this.canvasViewSize = new GLP.Vector();

		// program

		this.programManager = new ProgramManager( core );

		// matrix

		this.modelViewMatrix = new GLP.Matrix();
		this.normalMatrix = new GLP.Matrix();

		// tmp

		this.tmpLightDirection = new GLP.Vector();
		this.tmpMatrix = new GLP.Matrix();

		// quad

		this.quad = new GLP.PlaneGeometry( 2.0, 2.0 ).getComponent( this.power );

		// light

		this.lights = {
			needsUpdate: false,
			directionalLight: [],
			directionalLightShadow: [],
			spotLight: [],
			spotLightShadow: []
		};

	}

	public update( event: GLP.SystemUpdateEvent ): void {

		this.lights.needsUpdate = false;

		super.update( event );

	}

	protected beforeUpdateImpl( phase: string, event: GLP.SystemUpdateEvent, entities: Entity[] ): void {

		if ( phase == 'directionalLight' ) {

			if ( this.lights.directionalLight.length != entities.length ) this.lights.needsUpdate = true;

			this.lights.directionalLight.length = 0;
			this.lights.directionalLightShadow.length = 0;

		} else if ( phase == 'spotLight' ) {

			if ( this.lights.spotLight.length != entities.length ) this.lights.needsUpdate = true;

			this.lights.spotLight.length = 0;
			this.lights.spotLightShadow.length = 0;

		}

	}

	protected updateImpl( phase: string, entity: GLP.Entity, event: GLP.SystemUpdateEvent ): void {

		if ( phase == 'directionalLight' ) {

			this.collectLight( entity, event, 'directional' );

		} else if ( phase == 'spotLight' ) {

			this.collectLight( entity, event, 'spot' );

		} else if ( phase == 'postprocess' ) {

			this.renderPostProcess( entity + '_postprocess', GLP.ECS.getComponent<ComponentPostProcess>( event.world, entity, 'postprocess' )!, event, );

		} else {

			this.renderCamera( phase, entity, event );

		}

	}

	private collectLight( entity: GLP.Entity, event: GLP.SystemUpdateEvent, type: string ) {

		let shadowCameraArray: ( ShadowMapCamera | null )[] | undefined = undefined;

		if ( type == 'directional' ) {

			const light = GLP.ECS.getComponent<ComponentLightDirectional>( event.world, entity, 'directionalLight' )!;
			const matrix = GLP.ECS.getComponent<ComponentTransformMatrix>( event.world, entity, 'matrix' )!;

			this.lights.directionalLight.push( {
				direction: new GLP.Vector( 0.0, 1.0, 0.0, 0.0 ).applyMatrix4( matrix.world ),
				color: new GLP.Vector( light.color.x, light.color.y, light.color.z ).multiply( light.intensity )
			} );

			shadowCameraArray = this.lights.directionalLightShadow;

		} else if ( type == 'spot' ) {

			const light = GLP.ECS.getComponent<ComponentLightSpot>( event.world, entity, 'spotLight' )!;
			const matrix = GLP.ECS.getComponent<ComponentTransformMatrix>( event.world, entity, 'matrix' )!;

			this.lights.spotLight.push( {
				position: new GLP.Vector( 0, 0, 0, 1.0 ).applyMatrix4( matrix.world ),
				direction: new GLP.Vector( 0.0, 1.0, 0.0, 0.0 ).applyMatrix4( matrix.world ),
				color: new GLP.Vector( light.color.x, light.color.y, light.color.z ).multiply( light.intensity ),
				angle: Math.cos( light.angle / 2 ),
				blend: light.blend,
				distance: light.distance,
				decay: light.decay,
			} );

			shadowCameraArray = this.lights.spotLightShadow;

		}

		// shadowmap

		if ( shadowCameraArray ) {

			const camera = GLP.ECS.getComponent<ComponentCamera>( event.world, entity, 'camera' );
			const cameraShadowMap = GLP.ECS.getComponent<ComponentShadowmapCamera>( event.world, entity, 'renderCameraShadowMap' );

			if ( camera && cameraShadowMap ) {

				shadowCameraArray.push( {
					near: camera.near,
					far: camera.far,
					texture: cameraShadowMap.renderTarget.textures[ 0 ],
					viewMatrix: camera.viewMatrix,
					projectionMatrix: camera.projectionMatrix,
				} );

			} else {

				shadowCameraArray.push( null );

			}

		}

	}

	private renderCamera( renderPhase: string, entity: GLP.Entity, event: GLP.SystemUpdateEvent ) {

		const camera = GLP.ECS.getComponent<ComponentCamera>( event.world, entity, 'camera' )!;
		const cameraMatrix = GLP.ECS.getComponent<ComponentTransformMatrix>( event.world, entity, 'matrix' )!;

		let renderCameraType = 'renderCameraForward';

		if ( renderPhase == 'deferred' ) {

			renderCameraType = 'renderCameraDeferred';

		} else if ( renderPhase == 'shadowMap' ) {

			renderCameraType = 'renderCameraShadowMap';

		}

		const { renderTarget, postprocess } = GLP.ECS.getComponent<ComponentRenderCamera & ComponentShadowmapCamera>( event.world, entity, renderCameraType )!;

		if ( renderTarget ) {

			this.gl.viewport( 0, 0, renderTarget.size.x, renderTarget.size.y );
			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, renderTarget.getFrameBuffer() );
			this.gl.drawBuffers( renderTarget.textureAttachmentList );

		} else {

			this.gl.viewport( 0, 0, this.canvasViewSize.x, this.canvasViewSize.y );
			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

		}

		this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
		this.gl.clearDepth( 1.0 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
		this.gl.enable( this.gl.DEPTH_TEST );

		let materialType = 'material';

		if ( renderPhase == 'shadowMap' ) materialType = 'materialDepth';

		const meshes = GLP.ECS.getEntities( event.world, [ materialType, 'geometry' ] );

		for ( let i = 0; i < meshes.length; i ++ ) {

			const mesh = meshes[ i ];

			const material = GLP.ECS.getComponent<ComponentMaterial>( event.world, mesh, materialType );
			const geometry = GLP.ECS.getComponent<ComponentGeometry>( event.world, mesh, 'geometry' );
			const matrix = GLP.ECS.getComponent<ComponentTransformMatrix>( event.world, mesh, 'matrix' );

			if ( material && geometry && matrix ) {

				if ( material.renderType == renderPhase ) {

					this.draw( meshes[ i ] + renderPhase, geometry, material, event, {
						modelMatrix: matrix.world,
						viewMatrix: camera.viewMatrix,
						projectionMatrix: camera.projectionMatrix,
						cameraMatrix: cameraMatrix.world,
						near: camera.near,
						far: camera.far
					} );

				}

			}

		}

		if ( postprocess ) {

			this.renderPostProcess( entity + '_cameraPostProcess', postprocess, event, {
				viewMatrix: camera.viewMatrix,
				projectionMatrix: camera.projectionMatrix,
				cameraMatrix: cameraMatrix.world
			} );

		}

	}

	public renderPostProcess( entityId: string, postprocess: ComponentPostProcess, event: GLP.SystemUpdateEvent, matrix?: Matrix ) {

		this.gl.disable( this.gl.DEPTH_TEST );

		for ( let i = 0; i < postprocess.length; i ++ ) {

			const pp = postprocess[ i ];

			if ( pp.renderTarget ) {

				this.gl.viewport( 0, 0, pp.renderTarget.size.x, pp.renderTarget.size.y );
				this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, pp.renderTarget.getFrameBuffer() );
				this.gl.drawBuffers( pp.renderTarget.textureAttachmentList );

			} else {

				this.gl.viewport( 0, 0, this.canvasViewSize.x, this.canvasViewSize.y );
				this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

			}

			if ( pp.input && pp.uniforms ) {

				for ( let i = 0; i < pp.input.length; i ++ ) {

					pp.uniforms[ 'sampler' + i ] = {
						type: '1i',
						value: pp.input[ i ]
					};

				}

			}

			if ( ! matrix && pp.camera !== undefined ) {

				const camera = GLP.ECS.getComponent<ComponentCamera>( event.world, pp.camera, 'camera' )!;
				const cameraMatrix = GLP.ECS.getComponent<ComponentTransformMatrix>( event.world, pp.camera, 'matrix' )!;

				matrix = {
					viewMatrix: camera.viewMatrix,
					projectionMatrix: camera.projectionMatrix,
					cameraMatrix: cameraMatrix.world,
					near: camera.near,
					far: camera.far
				};

			}

			this.draw( entityId + i, pp.customGeometry || this.quad, pp, event, matrix );

		}

	}

	private draw( entityId: string, geometry: ComponentGeometry, material: ComponentMaterial, event: GLP.SystemUpdateEvent, matrix?: Matrix ) {

		this.textureUnit = 0;

		// program

		if ( material.__program === undefined || material.needsUpdate !== false || this.lights.needsUpdate ) {

			const vs = shaderParse( material.vertexShader, material.defines, this.lights );
			const fs = shaderParse( material.fragmentShader, material.defines, this.lights );

			material.__program = this.programManager.get( vs, fs );

			material.needsUpdate = false;

		}

		const program = material.__program;

		// update uniforms

		if ( matrix ) {

			if ( matrix.modelMatrix && matrix.viewMatrix ) {

				program.setUniform( 'modelMatrix', 'Matrix4fv', matrix.modelMatrix.elm );

				if ( matrix.viewMatrix ) {

					this.modelViewMatrix.copy( matrix.modelMatrix ).preMultiply( matrix.viewMatrix );

					this.normalMatrix.copy( this.modelViewMatrix );
					this.normalMatrix.inverse();
					this.normalMatrix.transpose();

					program.setUniform( 'normalMatrix', 'Matrix4fv', this.normalMatrix.elm );
					program.setUniform( 'modelViewMatrix', 'Matrix4fv', this.modelViewMatrix.elm );

				}

			}

			program.setUniform( 'cameraNear', '1fv', [ matrix.near ?? 0 ] );
			program.setUniform( 'cameraFar', '1fv', [ matrix.far ?? 0 ] );

			program.setUniform( 'cameraMatrix', 'Matrix4fv', matrix.cameraMatrix.elm );
			program.setUniform( 'viewMatrix', 'Matrix4fv', matrix.viewMatrix.elm );
			program.setUniform( 'projectionMatrix', 'Matrix4fv', matrix.projectionMatrix.elm );
			program.setUniform( 'projectionMatrixInverse', 'Matrix4fv', this.tmpMatrix.copy( matrix.projectionMatrix ).inverse().elm );

			for ( let i = 0; i < this.lights.directionalLight.length; i ++ ) {

				const dLight = this.lights.directionalLight[ i ];
				const dLightShadow = this.lights.directionalLightShadow[ i ];

				program.setUniform( 'directionalLight[' + i + '].direction', '3fv', dLight.direction.getElm( 'vec3' ) );
				program.setUniform( 'directionalLight[' + i + '].color', '3fv', dLight.color.getElm( 'vec3' ) );

				if ( dLightShadow ) {

					dLightShadow.texture.activate( this.textureUnit ++ );

					program.setUniform( 'directionalLightCamera[' + i + '].near', '1fv', [ dLightShadow.near ] );
					program.setUniform( 'directionalLightCamera[' + i + '].far', '1fv', [ dLightShadow.far ] );
					program.setUniform( 'directionalLightCamera[' + i + '].viewMatrix', 'Matrix4fv', dLightShadow.viewMatrix.elm );
					program.setUniform( 'directionalLightCamera[' + i + '].projectionMatrix', 'Matrix4fv', dLightShadow.projectionMatrix.elm );
					program.setUniform( 'directionalLightCamera[' + i + '].resolution', '2fv', dLightShadow.texture.size.getElm( "vec2" ) );
					program.setUniform( 'directionalLightShadowMap[' + i + ']', '1i', [ dLightShadow.texture.unit ] );

				}

			}

			for ( let i = 0; i < this.lights.spotLight.length; i ++ ) {

				const sLight = this.lights.spotLight[ i ];
				const sLightShadow = this.lights.spotLightShadow[ i ];

				this.tmpLightDirection.copy( sLight.direction ).applyMatrix3( matrix.viewMatrix );

				program.setUniform( 'spotLight[' + i + '].position', '3fv', sLight.position.getElm( 'vec3' ) );
				program.setUniform( 'spotLight[' + i + '].direction', '3fv', sLight.direction.getElm( 'vec3' ) );
				program.setUniform( 'spotLight[' + i + '].color', '3fv', sLight.color.getElm( 'vec3' ) );
				program.setUniform( 'spotLight[' + i + '].angle', '1fv', [ sLight.angle ] );
				program.setUniform( 'spotLight[' + i + '].blend', '1fv', [ sLight.blend ] );
				program.setUniform( 'spotLight[' + i + '].distance', '1fv', [ sLight.distance ] );
				program.setUniform( 'spotLight[' + i + '].decay', '1fv', [ sLight.decay ] );


				if ( sLightShadow ) {

					sLightShadow.texture.activate( this.textureUnit ++ );

					program.setUniform( 'spotLightCamera[' + i + '].near', '1fv', [ sLightShadow.near ] );
					program.setUniform( 'spotLightCamera[' + i + '].far', '1fv', [ sLightShadow.far ] );
					program.setUniform( 'spotLightCamera[' + i + '].viewMatrix', 'Matrix4fv', sLightShadow.viewMatrix.elm );
					program.setUniform( 'spotLightCamera[' + i + '].projectionMatrix', 'Matrix4fv', sLightShadow.projectionMatrix.elm );
					program.setUniform( 'spotLightCamera[' + i + '].resolution', '2fv', sLightShadow.texture.size.getElm( "vec2" ) );
					program.setUniform( 'spotLightShadowMap[' + i + ']', '1i', [ sLightShadow.texture.unit ] );

				}

			}

		}

		if ( material.uniforms ) {

			const keys = Object.keys( material.uniforms );

			for ( let i = 0; i < keys.length; i ++ ) {

				const name = keys[ i ];
				const uni = material.uniforms[ name ];
				const type = uni.type;
				const value = uni.value;

				const arrayValue: ( number | boolean )[] = [];

				const _ = ( v: Uniformable ) => {

					if ( typeof v == 'number' || typeof v == 'boolean' ) {

						arrayValue.push( v );

					} else if ( 'isVector' in v ) {

						arrayValue.push( ...v.getElm( ( 'vec' + type.charAt( 0 ) ) as any ) );

					} else if ( 'isTexture' in v ) {

						v.activate( this.textureUnit ++ );

						arrayValue.push( v.unit );

					} else {

						arrayValue.push( ...v.elm );

					}

				};

				if ( Array.isArray( value ) ) {

					for ( let j = 0; j < value.length; j ++ ) {

						_( value[ j ] );

					}

				} else {

					_( value );

				}

				program.setUniform( name, type, arrayValue );

			}

		}

		// update attributes

		const vao = program.getVAO( entityId.toString() );

		if ( vao ) {

			if ( geometry.needsUpdate === undefined ) {

				geometry.needsUpdate = new Map();

			}

			if ( ! geometry.needsUpdate.get( vao ) ) {

				for ( let i = 0; i < geometry.attributes.length; i ++ ) {

					const attr = geometry.attributes[ i ];

					vao.setAttribute( attr.name, attr.buffer, attr.size, { instanceDivisor: attr.instanceDivisor } );

				}

				vao.setIndex( geometry.index.buffer );

				geometry.needsUpdate.set( vao, true );

			}

			// draw

			program.use( () => {

				program.uploadUniforms();

				this.gl.bindVertexArray( vao.getVAO() );

				if ( vao.instanceCount > 0 ) {

					this.gl.drawElementsInstanced( this.gl.TRIANGLES, vao.indexCount, this.gl.UNSIGNED_SHORT, 0, vao.instanceCount );

				} else {

					this.gl.drawElements( this.gl.TRIANGLES, vao.indexCount, this.gl.UNSIGNED_SHORT, 0 );

				}

				this.gl.bindVertexArray( null );

			} );

		}

	}

	public resize( viewSize: GLP.Vector, pixelSize: GLP.Vector ) {

		this.canvasViewSize.copy( viewSize );
		this.canvasPixelSize.copy( pixelSize );

	}

}
