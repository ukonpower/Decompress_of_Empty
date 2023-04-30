import * as GLP from 'glpower';
import { Entity, Uniformable } from 'glpower';
import { power, gl, gpuState, world, gl } from '~/ts/Globals';
import { ComponentCamera, ComponentGeometry, ComponentLightDirectional, ComponentLightSpot, ComponentPostProcess, ComponentRenderCamera, ComponentShadowmapCamera, ComponentMatrix, ComponentState } from '../../Component';
import { ComponentMaterial } from '../../Component/Material';
import { ProgramManager } from './ProgramManager';
import { shaderParse } from './ShaderParser';
import { applyUniforms } from '../../Utils/Uniforms';

type TransformData = {
	modelMatrix?: GLP.Matrix,
	viewMatrix: GLP.Matrix,
	projectionMatrix: GLP.Matrix
	cameraMatrix: GLP.Matrix,
	near?: number,
	far?: number,
	cameraPosition?: GLP.IVector3
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
	private tmpModelMatrixInverse: GLP.Matrix;
	private tmpProjectionMatrixInverse: GLP.Matrix;

	// quad

	private quad: ComponentGeometry;

	// lights

	private lights: Lights;

	// render query

	private queryList: WebGLQuery[];
	private queryListQueued: {name: string, query: WebGLQuery}[];

	private renderPhase: string;

	constructor() {

		super( {
			"directionalLight": [ 'directionalLight', 'position' ],
			"spotLight": [ 'spotLight', 'position' ],
			"shadowMap": [ 'camera', 'renderCameraShadowMap' ],
			"deferred": [ "camera", "renderCameraDeferred" ],
			"forward": [ "camera", "renderCameraForward" ],
			"postprocess": [ 'postprocess' ]
		} );

		// canvas

		this.canvasPixelSize = new GLP.Vector();
		this.canvasViewSize = new GLP.Vector();

		// program

		this.programManager = new ProgramManager( power );

		// matrix

		this.modelViewMatrix = new GLP.Matrix();
		this.normalMatrix = new GLP.Matrix();

		// tmp

		this.tmpLightDirection = new GLP.Vector();
		this.tmpModelMatrixInverse = new GLP.Matrix();
		this.tmpProjectionMatrixInverse = new GLP.Matrix();

		// quad

		this.quad = new GLP.PlaneGeometry( 2.0, 2.0 ).getComponent( power );

		// light

		this.lights = {
			needsUpdate: false,
			directionalLight: [],
			directionalLightShadow: [],
			spotLight: [],
			spotLightShadow: []
		};

		gl.disable( gl.CULL_FACE );

		// queries

		this.queryList = [];
		this.queryListQueued = [];

		// state

		this.renderPhase = '';

	}

	public update( event: GLP.SystemUpdateEvent ): void {

		this.lights.needsUpdate = false;

		if ( process.env.NODE_ENV == 'development' ) {

			const disjoint = gl.getParameter( power.extDisJointTimerQuery.GPU_DISJOINT_EXT );

			if ( disjoint ) {

				this.queryList.forEach( q => gl.deleteQuery( q ) );

				this.queryList.length = 0;

			} else {

				if ( this.queryListQueued.length > 0 ) {

					let l = this.queryListQueued.length;

					for ( let i = l - 1; i >= 0; i -- ) {

						let q = this.queryListQueued[ i ];

						const resultAvailable = gl.getQueryParameter( q.query, gl.QUERY_RESULT_AVAILABLE );

						if ( resultAvailable ) {

							const result = gl.getQueryParameter( q.query, gl.QUERY_RESULT );

							this.queryList.push( q.query );

							this.queryListQueued.splice( i, 1 );

							if ( gpuState ) {

								gpuState.setRenderTime( q.name, result / 1000 / 1000 );

							}

						}

					}

				}

			}

		}

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

		this.renderPhase = phase;

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
			const matrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, entity, 'matrix' )!;

			this.lights.directionalLight.push( {
				direction: new GLP.Vector( 0.0, 1.0, 0.0, 0.0 ).applyMatrix4( matrix.world ).normalize(),
				color: new GLP.Vector( light.color.x, light.color.y, light.color.z ).multiply( light.intensity )
			} );

			shadowCameraArray = this.lights.directionalLightShadow;

		} else if ( type == 'spot' ) {

			const light = GLP.ECS.getComponent<ComponentLightSpot>( event.world, entity, 'spotLight' )!;
			const matrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, entity, 'matrix' )!;

			this.lights.spotLight.push( {
				position: new GLP.Vector( 0, 0, 0, 1.0 ).applyMatrix4( matrix.world ),
				direction: new GLP.Vector( 0.0, 1.0, 0.0, 0.0 ).applyMatrix4( matrix.world ).normalize(),
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
		const cameraPosition = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, entity, 'position' )!;
		const cameraMatrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, entity, 'matrix' )!;

		let renderCameraType = 'renderCameraForward';

		if ( renderPhase == 'deferred' ) {

			renderCameraType = 'renderCameraDeferred';

		} else if ( renderPhase == 'shadowMap' ) {

			renderCameraType = 'renderCameraShadowMap';

		}

		const { renderTarget, postprocess } = GLP.ECS.getComponent<ComponentRenderCamera & ComponentShadowmapCamera>( event.world, entity, renderCameraType )!;

		if ( renderTarget ) {

			gl.viewport( 0, 0, renderTarget.size.x, renderTarget.size.y );
			gl.bindFramebuffer( gl.FRAMEBUFFER, renderTarget.getFrameBuffer() );
			gl.drawBuffers( renderTarget.textureAttachmentList );

		} else {

			gl.viewport( 0, 0, this.canvasViewSize.x, this.canvasViewSize.y );
			gl.bindFramebuffer( gl.FRAMEBUFFER, null );

		}


		if ( renderCameraType == 'renderCameraForward' ) {

			gl.blendEquation( gl.FUNC_ADD );
			gl.enable( gl.BLEND );

		} else {

			gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			gl.clearDepth( 1.0 );
			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

			gl.disable( gl.BLEND );

		}

		gl.disable( gl.CULL_FACE );
		gl.enable( gl.DEPTH_TEST );

		let materialType = 'material';

		if ( renderPhase == 'shadowMap' ) materialType = 'materialDepth';

		const meshes = GLP.ECS.getEntities( event.world, [ materialType, 'geometry' ] );

		for ( let i = 0; i < meshes.length; i ++ ) {

			const mesh = meshes[ i ];

			const state = GLP.ECS.getComponent<ComponentState>( world, mesh, 'state' );

			if ( state && ! state.visible ) continue;

			const material = GLP.ECS.getComponent<ComponentMaterial>( event.world, mesh, materialType );
			const geometry = GLP.ECS.getComponent<ComponentGeometry>( event.world, mesh, 'geometry' );
			const matrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, mesh, 'matrix' );

			if ( material && geometry && matrix ) {

				if ( material.renderType == renderPhase ) {

					this.draw( meshes[ i ] + renderPhase, geometry, material, event, {
						modelMatrix: matrix.world,
						viewMatrix: camera.viewMatrix,
						projectionMatrix: camera.projectionMatrix,
						cameraMatrix: cameraMatrix.world,
						near: camera.near,
						far: camera.far,
						cameraPosition
					} );

				}

			}

		}

		if ( postprocess ) {

			this.renderPostProcess( entity + '_cameraPostProcess', postprocess, event );

		}

	}

	public renderPostProcess( entityId: string, postprocess: ComponentPostProcess, event: GLP.SystemUpdateEvent ) {

		gl.disable( gl.DEPTH_TEST );

		for ( let i = 0; i < postprocess.length; i ++ ) {

			const pp = postprocess[ i ];

			if ( pp.renderTarget ) {

				gl.viewport( 0, 0, pp.renderTarget.size.x, pp.renderTarget.size.y );
				gl.bindFramebuffer( gl.FRAMEBUFFER, pp.renderTarget.getFrameBuffer() );
				gl.drawBuffers( pp.renderTarget.textureAttachmentList );

			} else {

				gl.viewport( 0, 0, this.canvasViewSize.x, this.canvasViewSize.y );
				gl.bindFramebuffer( gl.FRAMEBUFFER, null );

			}

			if ( ! pp.uniforms ) {

				pp.uniforms = {};

			}

			if ( pp.input ) {

				for ( let i = 0; i < pp.input.length; i ++ ) {

					pp.uniforms[ 'sampler' + i ] = {
						type: '1i',
						value: pp.input[ i ]
					};

				}

			}

			let transformData: TransformData | undefined = undefined;

			if ( pp.camera !== undefined ) {

				const camera = GLP.ECS.getComponent<ComponentCamera>( event.world, pp.camera, 'camera' )!;
				const cameraMatrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, pp.camera, 'matrix' )!;
				const cameraPosition = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, pp.camera, 'position' );

				transformData = {
					viewMatrix: camera.viewMatrix,
					projectionMatrix: camera.projectionMatrix,
					cameraMatrix: cameraMatrix.world,
					near: camera.near,
					far: camera.far
				};

				if ( cameraPosition ) transformData.cameraPosition = cameraPosition;

			}

			this.draw( entityId + i, pp.customGeometry || this.quad, pp, event, transformData );

		}

	}

	private draw( entityId: string, geometry: ComponentGeometry, material: ComponentMaterial, event: GLP.SystemUpdateEvent, matrix?: TransformData ) {

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
				program.setUniform( 'modelMatrixInverse', 'Matrix4fv', this.tmpModelMatrixInverse.copy( matrix.modelMatrix ).inverse().elm );

				if ( matrix.viewMatrix ) {

					this.modelViewMatrix.copy( matrix.modelMatrix ).preMultiply( matrix.viewMatrix );

					this.normalMatrix.copy( this.modelViewMatrix );
					this.normalMatrix.inverse();
					this.normalMatrix.transpose();

					program.setUniform( 'normalMatrix', 'Matrix4fv', this.normalMatrix.elm );
					program.setUniform( 'modelViewMatrix', 'Matrix4fv', this.modelViewMatrix.elm );

				}

			}

			matrix.near && program.setUniform( 'cameraNear', '1fv', [ matrix.near ] );
			matrix.far && program.setUniform( 'cameraFar', '1fv', [ matrix.far ] );
			matrix.cameraPosition && program.setUniform( 'uRenderCameraPosition', '3fv', [ matrix.cameraPosition.x, matrix.cameraPosition.y, matrix.cameraPosition.z ] );

			program.setUniform( 'cameraMatrix', 'Matrix4fv', matrix.cameraMatrix.elm );
			program.setUniform( 'viewMatrix', 'Matrix4fv', matrix.viewMatrix.elm );
			program.setUniform( 'projectionMatrix', 'Matrix4fv', matrix.projectionMatrix.elm );
			program.setUniform( 'projectionMatrixInverse', 'Matrix4fv', this.tmpProjectionMatrixInverse.copy( matrix.projectionMatrix ).inverse().elm );

			if ( material.useLight ) {

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

		}

		if ( material.uniforms ) {

			this.textureUnit = applyUniforms( program, material.uniforms, this.textureUnit ).lastTextureUnit;

		}

		// blending

		if ( material.blending == 'add' ) {

			gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

		} else {

			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

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

				if ( geometry.index ) {

					vao.setIndex( geometry.index.buffer );

				}

				geometry.needsUpdate.set( vao, true );

			}

			// draw

			program.use( () => {

				program.uploadUniforms();

				gl.bindVertexArray( vao.getVAO() );

				let query: WebGLQuery | null = null;

				if ( process.env.NODE_ENV == 'development' ) {

					query = this.queryList.pop() || null;

					if ( query == null ) {

						query = gl.createQuery();

					}

					if ( query ) {

						gl.beginQuery( power.extDisJointTimerQuery.TIME_ELAPSED_EXT, query );

					}

				}

				if ( vao.instanceCount > 0 ) {

					if ( vao.indexBuffer ) {

						gl.drawElementsInstanced( material.drawType ?? gl.TRIANGLES, vao.indexCount, gl.UNSIGNED_SHORT, 0, vao.instanceCount );

					} else {

						gl.drawArraysInstanced( material.drawType ?? gl.TRIANGLES, 0, vao.vertCount, vao.instanceCount );

					}

				} else {

					if ( vao.indexBuffer ) {

						gl.drawElements( material.drawType ?? gl.TRIANGLES, vao.indexCount, gl.UNSIGNED_SHORT, 0 );

					} else {

						gl.drawArrays( material.drawType ?? gl.TRIANGLES, 0, vao.vertCount );

					}

				}

				if ( process.env.NODE_ENV == 'development' ) {

					if ( query ) {

						gl.endQuery( power.extDisJointTimerQuery.TIME_ELAPSED_EXT );

						this.queryListQueued.push( {
							name: this.renderPhase + '/' + material.name,
							query: query
						} );

					}

				}

				gl.bindVertexArray( null );

			} );

		}

	}

	public resize( viewSize: GLP.Vector, pixelSize: GLP.Vector ) {

		this.canvasViewSize.copy( viewSize );
		this.canvasPixelSize.copy( pixelSize );

	}

}
