import * as GLP from 'glpower';

import basicVert from './shaders/basic.vs';

// materials

import deferredMaterialFrag from './shaders/deferredMaterial.fs';
import deferredShadingFrag from './shaders/deferredShading.fs';

import logoVert from './shaders/logo.vs';
import logoFrag from './shaders/logo.fs';

// post process

import quadVert from './shaders/quad.vs';

import fxaaFrag from './shaders/fxaa.fs';

import bloomBlurFrag from './shaders/bloomBlur.fs';
import bloomBrightFrag from './shaders/bloomBright.fs';

import lightShaftFrag from './shaders/lightShaft.fs';

import compositeFrag from './shaders/composite.fs';
import { ComponentBLidge, ComponentCamera, ComponentCameraOrthographic, ComponentCameraPerspective, ComponentEvents, ComponentGeometry, ComponentLightDirectional, ComponentLightSpot, ComponentMaterial, ComponentPostProcess, ComponentRenderCamera, ComponentSceneNode, ComponentShadowmapCamera, ComponentTransformMatrix } from '../Component';

interface EmptyProps {
	position?: GLP.IVector3;
	rotation?: GLP.IVector3;
	scale?: GLP.IVector3;
}

interface MeshProps extends EmptyProps{
	material?: ComponentMaterial
	geometry: ComponentGeometry
}

interface CameraProps extends EmptyProps {
	near?: number;
	far?: number;
	fov?: number;
}

interface BLidgeProps extends EmptyProps {
	name: string,
	type?: GLP.BLidgeObjectType
}

interface MaterialParam {
	name: string,
	uniforms: GLP.Uniforms
}

export class Factory {

	private power: GLP.Power;
	private gl: WebGL2RenderingContext;
	private world: GLP.World;

	// uniforms

	private uniformCameraPos: GLP.Vector;

	constructor( power: GLP.Power, world: GLP.World ) {

		this.power = power;
		this.gl = this.power.gl;
		this.world = world;

		// uniforms

		this.uniformCameraPos = new GLP.Vector();

	}

	/*-------------------------------
		Empty
	-------------------------------*/

	public empty( props: EmptyProps = {} ) {

		const entity = GLP.ECS.createEntity( this.world );
		GLP.ECS.addComponent<GLP.ComponentVector3>( this.world, entity, 'position', props.position ?? { x: 0, y: 0, z: 0 } );
		GLP.ECS.addComponent<GLP.ComponentVector3>( this.world, entity, 'rotation', props.rotation ?? { x: 0, y: 0, z: 0 } );
		GLP.ECS.addComponent<GLP.ComponentVector4>( this.world, entity, 'quaternion', { x: 0, y: 0, z: 0, w: 1 } );
		GLP.ECS.addComponent<GLP.ComponentVector3>( this.world, entity, 'scale', props.scale ?? { x: 1, y: 1, z: 1 } );
		GLP.ECS.addComponent<ComponentTransformMatrix>( this.world, entity, 'matrix', { local: new GLP.Matrix(), world: new GLP.Matrix() } );
		GLP.ECS.addComponent<ComponentSceneNode>( this.world, entity, 'sceneNode', { children: [] } );

		return entity;

	}

	/*-------------------------------
		BLidge
	-------------------------------*/

	public appendBlidge( entity: GLP.Entity, props: BLidgeProps ) {

		GLP.ECS.addComponent<ComponentBLidge>( this.world, entity, 'blidge', {
			name: props.name,
			type: props.type ?? 'empty',
		} );

		return entity;

	}

	/*-------------------------------
		Mesh
	-------------------------------*/

	public appendMesh( entity: GLP.Entity, geometry: ComponentGeometry, materialParam: MaterialParam ) {

		const name = materialParam.name;

		const material: ComponentMaterial | null = {
			vertexShader: basicVert,
			fragmentShader: deferredMaterialFrag,
			uniforms: {
				...materialParam.uniforms
			},
			renderType: 'deferred',
		};

		if ( name == 'Logo' ) {

			material.vertexShader = logoVert;
			material.fragmentShader = logoFrag;

		}

		GLP.ECS.addComponent<ComponentMaterial>( this.world, entity, 'material', material );

		GLP.ECS.addComponent<ComponentMaterial>( this.world, entity, 'materialDepth', { ...material, defines: { ...material.defines, IS_DEPTH: '' }, renderType: 'shadowMap' } );

		GLP.ECS.addComponent<ComponentGeometry>( this.world, entity, 'geometry', geometry );

		return entity;

	}

	public appendCube( entity: GLP.Entity, materialParam: MaterialParam ) {

		return this.appendMesh( entity, new GLP.CubeGeometry().getComponent( this.power ), materialParam );

	}

	public appendSphere( entity: GLP.Entity, materialParam: MaterialParam ) {

		return this.appendMesh( entity, new GLP.SphereGeometry().getComponent( this.power ), materialParam );

	}

	public appendPlane( entity: GLP.Entity, materialParam: MaterialParam ) {

		return this.appendMesh( entity, new GLP.PlaneGeometry().getComponent( this.power ), materialParam );

	}

	/*-------------------------------
		Camera
	-------------------------------*/

	public camera( props: CameraProps, rt: {
		forwardRenderTarget: GLP.GLPowerFrameBuffer,
		deferredRenderTarget: GLP.GLPowerFrameBuffer,
		deferredCompositorRenderTarget: GLP.GLPowerFrameBuffer,
	} ) {

		const entity = this.empty();

		GLP.ECS.addComponent<ComponentCamera>( this.world, entity, 'camera', {
			near: props.near ?? 0.001,
			far: props.far ?? 1000,
			aspectRatio: 1,
			projectionMatrix: new GLP.Matrix(),
			viewMatrix: new GLP.Matrix(),
		} );

		GLP.ECS.addComponent<ComponentCameraPerspective>( this.world, entity, 'perspective', {
			fov: props.fov ?? 50,
		} );

		GLP.ECS.addComponent<ComponentRenderCamera>( this.world, entity, 'renderCameraForward', {
			renderTarget: rt.forwardRenderTarget,
		} );

		GLP.ECS.addComponent<ComponentRenderCamera>( this.world, entity, 'renderCameraDeferred',
			{
				renderTarget: rt.deferredRenderTarget,
				postprocess: [ {
					input: rt.deferredRenderTarget.textures,
					vertexShader: quadVert,
					fragmentShader: deferredShadingFrag,
					renderTarget: rt.deferredCompositorRenderTarget,
					uniforms: {
						uColor: {
							value: new GLP.Vector( 1.0, 0.0, 0.0 ),
							type: '3f'
						},
						uCameraPosition: {
							value: this.uniformCameraPos,
							type: '3f'
						}
					},
				} ],
			},
		);

		// event

		const componentPosition = GLP.ECS.getComponent<GLP.ComponentVector3>( this.world, entity, 'position' )!;

		GLP.ECS.addComponent<ComponentEvents>( this.world, entity, 'events',
			{
				onUpdate: ( e ) => {

					this.uniformCameraPos.copy( componentPosition );

				},
				onResize: ( e ) => {

					rt.forwardRenderTarget.setSize( e.size );
					rt.deferredRenderTarget.setSize( e.size );
					rt.deferredCompositorRenderTarget.setSize( e.size );

				}
			},
		);

		return entity;

	}

	/*-------------------------------
		Light
	-------------------------------*/

	public appendShadowMap( entity: GLP.Entity ) {

		// shadowmap

		const rtShadowMap = new GLP.GLPowerFrameBuffer( this.gl );
		rtShadowMap.setTexture( [ this.power.createTexture() ] );

		GLP.ECS.addComponent<ComponentCamera>( this.world, entity, 'camera', {
			near: 0.01,
			far: 100.0,
			aspectRatio: 1,
			projectionMatrix: new GLP.Matrix(),
			viewMatrix: new GLP.Matrix(),
		} );

		GLP.ECS.addComponent<ComponentShadowmapCamera>( this.world, entity, 'renderCameraShadowMap', {
			renderTarget: rtShadowMap
		} );

		// events

		GLP.ECS.addComponent<ComponentEvents>( this.world, entity, 'events',
			{
				onUpdate: ( e ) => {
				},
				onResize: ( e ) => {

					rtShadowMap.setSize( 512, 512 );

				}
			},
		);

	}

	public appendDirectionalLight( entity: GLP.Entity, param: GLP.BLidgeDirectionalLightParam ) {

		GLP.ECS.addComponent<ComponentLightDirectional>( this.world, entity, 'directionalLight', {
			color: new GLP.Vector( param.color.x, param.color.y, param.color.z ).multiply( Math.PI ),
			intensity: param.intensity
		} );

		this.appendShadowMap( entity );

		GLP.ECS.addComponent<ComponentCameraOrthographic>( this.world, entity, 'orthographic', {
			width: 15,
			height: 15
		} );

	}

	public appendSpotLight( entity: GLP.Entity, param: GLP.BLidgeSpotLightParam ) {

		GLP.ECS.addComponent<ComponentLightSpot>( this.world, entity, 'spotLight', {
			color: new GLP.Vector( param.color.x, param.color.y, param.color.z ).multiply( Math.PI ),
			intensity: param.intensity,
			angle: param.angle,
			blend: param.blend,
			distance: 30,
			decay: 2
		} );

		this.appendShadowMap( entity );

		GLP.ECS.addComponent<ComponentCameraPerspective>( this.world, entity, 'perspective', {
			fov: param.angle / Math.PI * 180,
		} );

	}

	/*-------------------------------
		PostProcess
	-------------------------------*/

	public postprocess( input: GLP.GLPowerFrameBuffer, gBuffer: GLP.GLPowerTexture[], camera: GLP.Entity, out: GLP.GLPowerFrameBuffer | null ) {

		const entity = this.empty();

		const bloomRenderCount = 4;

		// rt

		const rt1 = new GLP.GLPowerFrameBuffer( this.gl ).setTexture( [ this.power.createTexture() ] );
		const rt2 = new GLP.GLPowerFrameBuffer( this.gl ).setTexture( [ this.power.createTexture() ] );
		const rt3 = new GLP.GLPowerFrameBuffer( this.gl ).setTexture( [ this.power.createTexture() ] );

		const rtBloomVertical: GLP.GLPowerFrameBuffer[] = [];
		const rtBloomHorizonal: GLP.GLPowerFrameBuffer[] = [];

		const rtLightShaft = new GLP.GLPowerFrameBuffer( this.gl ).setTexture( [
			this.power.createTexture().setting( { magFilter: this.gl.LINEAR, minFilter: this.gl.LINEAR } ),
		] );

		for ( let i = 0; i < bloomRenderCount; i ++ ) {

			rtBloomVertical.push( new GLP.GLPowerFrameBuffer( this.gl ).setTexture( [
				this.power.createTexture().setting( { magFilter: this.gl.LINEAR, minFilter: this.gl.LINEAR } ),
			] ) );

			rtBloomHorizonal.push( new GLP.GLPowerFrameBuffer( this.gl ).setTexture( [
				this.power.createTexture().setting( { magFilter: this.gl.LINEAR, minFilter: this.gl.LINEAR } ),
			] ) );

		}

		// resolution

		const resolution = new GLP.Vector();
		const resolutionInv = new GLP.Vector();
		const resolutionBloom: GLP.Vector[] = [];

		// pp

		const postprocess: ComponentPostProcess = [];

		// fxaa

		postprocess.push( {
			input: input.textures,
			vertexShader: quadVert,
			fragmentShader: fxaaFrag,
			renderTarget: rt1,
			uniforms: {
				uResolution: {
					type: '2fv',
					value: resolution
				},
				uResolutionInv: {
					type: '2fv',
					value: resolutionInv
				},
			}
		} );

		// bloom bright

		postprocess.push( {
			input: rt1.textures,
			renderTarget: rt2,
			vertexShader: quadVert,
			fragmentShader: bloomBrightFrag,
			uniforms: {
				threshold: {
					type: '1f',
					value: 0.5,
				},
			},
		} );

		// bloom blur

		let bloomInput: GLP.GLPowerTexture[] = rt2.textures;

		for ( let i = 0; i < bloomRenderCount; i ++ ) {

			const rtVertical = rtBloomVertical[ i ];
			const rtHorizonal = rtBloomHorizonal[ i ];

			const resolution = new GLP.Vector();
			resolutionBloom.push( resolution );

			postprocess.push( {
				input: bloomInput,
				renderTarget: rtVertical,
				vertexShader: quadVert,
				fragmentShader: bloomBlurFrag,
				uniforms: {
					uIsVertical: {
						type: '1i',
						value: true
					},
					uWeights: {
						type: '1fv',
						value: this.weight( bloomRenderCount )
					},
					uResolution: {
						type: '2fv',
						value: resolution,
					}
				},
				defines: {
					GAUSS_WEIGHTS: bloomRenderCount.toString()
				}
			} );

			postprocess.push( {
				input: rtVertical.textures,
				renderTarget: rtHorizonal,
				vertexShader: quadVert,
				fragmentShader: bloomBlurFrag,
				uniforms: {
					uIsVertical: {
						type: '1i',
						value: false
					},
					uWeights: {
						type: '1fv',
						value: this.weight( bloomRenderCount )
					},
					uResolution: {
						type: '2fv',
						value: resolution,
					}
				},
				defines: {
					GAUSS_WEIGHTS: bloomRenderCount.toString()
				} } );

			bloomInput = rtHorizonal.textures;

		}

		// light shaft

		postprocess.push( {
			input: gBuffer,
			renderTarget: rtLightShaft,
			vertexShader: quadVert,
			fragmentShader: lightShaftFrag,
			uniforms: {
				uCameraPosition: {
					value: this.uniformCameraPos,
					type: '3f'
				}
			},
			defines: {
			},
			camera,
		} );

		// composite

		postprocess.push( {
			input: rt1.textures,
			renderTarget: out,
			vertexShader: quadVert,
			fragmentShader: compositeFrag,
			uniforms: {
				uBloomTexture: {
					value: rtBloomHorizonal.map( rt => rt.textures[ 0 ] ),
					type: '1iv'
				},
				uLightShaftTexture: {
					value: rtLightShaft.textures,
					type: '1i'
				}
			},
			defines: {
				BLOOM_COUNT: bloomRenderCount.toString()
			}
		}, );

		GLP.ECS.addComponent<ComponentPostProcess>( this.world, entity, 'postprocess', postprocess );

		GLP.ECS.addComponent<ComponentEvents>( this.world, entity, 'events', {
			onResize: ( e ) => {

				resolution.copy( e.size );
				resolutionInv.set( 1.0, 1.0 ).divide( e.size );

				rt1.setSize( e.size );
				rt2.setSize( e.size );
				rt3.setSize( e.size );

				let scale = 2;

				for ( let i = 0; i < bloomRenderCount; i ++ ) {

					resolutionBloom[ i ].copy( e.size ).multiply( 1.0 / scale );

					rtBloomHorizonal[ i ].setSize( resolutionBloom[ i ] );
					rtBloomVertical[ i ].setSize( resolutionBloom[ i ] );

					scale *= 2.0;

				}

				rtLightShaft.setSize( e.size.clone().multiply( 0.5 ) );

			}
		} );

	}

	private weight( num: number ) {

		const weight = new Array( num );

		// https://wgld.org/d/webgl/w057.html
		let t = 0.0;
		const d = 100;
		for ( let i = 0; i < weight.length; i ++ ) {

			const r = 1.0 + 2.0 * i;
			let w = Math.exp( - 0.5 * ( r * r ) / d );
			weight[ i ] = w;

			if ( i > 0 ) {

				w *= 2.0;

			}

			t += w;

		}

		for ( let i = 0; i < weight.length; i ++ ) {

			weight[ i ] /= t;

		}

		return weight;

	}

}
