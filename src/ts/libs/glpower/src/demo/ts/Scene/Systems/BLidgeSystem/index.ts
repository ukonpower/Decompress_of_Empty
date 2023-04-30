import * as GLP from 'glpower';
import { ComponentBLidge, ComponentCameraPerspective } from '../../Component';
import { Factory } from '../../Factory';
import { SceneGraph } from '../../SceneGraph';

export class BLidgeSystem extends GLP.System {

	public power: GLP.Power;
	public world: GLP.World;
	public factory: Factory;
	public sceneGraph: SceneGraph;
	public blidge: GLP.BLidge;

	private root: GLP.Entity;
	private camera: GLP.Entity;
	private objects: Map<string, GLP.Entity>;

	// frame

	private frame: number;
	private play: boolean;

	// tmp
	private tmpQuaternion: GLP.Quaternion;

	constructor( power: GLP.Power, world: GLP.World, camera: GLP.Entity, sceneGraph: SceneGraph, factory: Factory ) {

		super( {
			move: [ 'blidge', 'position', 'quaternion', 'scale' ]
		} );

		this.power = power;
		this.world = world;
		this.sceneGraph = sceneGraph;
		this.factory = factory;

		// objects

		this.root = this.factory.empty();
		this.camera = camera;
		this.objects = new Map();

		// frame

		this.frame = 0;
		this.play = false;

		// blidge

		this.blidge = new GLP.BLidge( 'ws://localhost:3100' );

		this.blidge.on( 'error', () => {

			this.blidge.loadJsonScene( BASE_PATH + '/assets/demo/scene.json' );
			this.play = true;

		} );

		this.blidge.on( 'sync/scene', this.onSyncScene.bind( this ) );

		this.blidge.on( 'sync/timeline', ( frame: GLP.BLidgeSceneFrame ) => {

			const t = frame.current / frame.fps;

			this.emit( 'seek', [ t, frame.playing ] );

		} );

		// tmp

		this.tmpQuaternion = new GLP.Quaternion();

	}

	public update( event: GLP.SystemUpdateEvent ): void {

		if ( this.play ) {

			this.frame += event.deltaTime * this.blidge.frame.fps;

			this.frame %= this.blidge.frame.end;

			if ( ! this.blidge.connected ) {

				this.emit( 'seek', [ this.frame / this.blidge.frame.fps, true ] );

			}

		}

		super.update( event );

	}

	protected updateImpl( logicName: string, entity: number, event: GLP.SystemUpdateEvent ): void {

		const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( event.world, entity, 'blidge' );
		const positionComponent = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, entity, 'position' )!;
		const scaleComponent = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, entity, 'scale' )!;
		const rotationComponent = GLP.ECS.getComponent<GLP.ComponentVector4>( event.world, entity, 'quaternion' )!;

		const frame = this.blidge.connected ? this.blidge.frame.current : this.frame;

		if ( blidgeComponent ) {

			if ( blidgeComponent.curveGroups ) {

				if ( blidgeComponent.curveGroups.position ) {

					const position = blidgeComponent.curveGroups.position.setFrame( frame ).value;

					positionComponent.x = position.x;
					positionComponent.y = position.y;
					positionComponent.z = position.z;

				}

				if ( blidgeComponent.curveGroups.rotation ) {

					const rot = blidgeComponent.curveGroups.rotation.setFrame( frame ).value;

					let rotXOffset = 0;

					if ( blidgeComponent.type == 'camera' ) rotXOffset = - Math.PI / 2;

					this.tmpQuaternion.setFromEuler( {
						x: rot.x + rotXOffset,
						y: rot.y,
						z: rot.z
					}, 'YZX' );

					rotationComponent.x = this.tmpQuaternion.x;
					rotationComponent.y = this.tmpQuaternion.y;
					rotationComponent.z = this.tmpQuaternion.z;
					rotationComponent.w = this.tmpQuaternion.w;

				}

				if ( blidgeComponent.curveGroups.scale ) {

					const scale = blidgeComponent.curveGroups.scale.setFrame( frame ).value;

					scaleComponent.x = scale.x;
					scaleComponent.y = scale.y;
					scaleComponent.z = scale.z;

				}

				if ( blidgeComponent.curveGroups.uniforms ) {

					for ( let i = 0; i < blidgeComponent.curveGroups.uniforms.length; i ++ ) {

						const uni = blidgeComponent.curveGroups.uniforms[ i ];

						uni.curve.setFrame( frame );

					}

				}

			}

		}

	}

	private onSyncScene( blidge: GLP.BLidge ) {

		const timeStamp = new Date().getTime();

		// create entity

		blidge.objects.forEach( obj => {

			const type = obj.type;
			let entity = this.objects.get( obj.name );

			if ( entity === undefined ) {

				if ( type == 'camera' ) {

					entity = this.camera;

					const componentCamera = GLP.ECS.getComponent<ComponentCameraPerspective>( this.world, entity, 'perspective' );

					if ( componentCamera && obj.param ) {

						componentCamera.fov = ( obj.param as GLP.BLidgeCameraParam ).fov;

					}

					entity = this.factory.appendBlidge( entity, { name: obj.name, type: "camera" } );

				} else {

					entity = this.factory.empty();
					entity = this.factory.appendBlidge( entity, { name: obj.name, type: "empty" } );

				}

				this.objects.set( obj.name, entity );

			}

			const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( this.world, entity, 'blidge' );

			if ( blidgeComponent ) {

				blidgeComponent.updateTime = timeStamp;

				// actions

				blidgeComponent.curveGroups = {};

				blidgeComponent.curveGroups.position = this.blidge.curveGroups.find( curveGroup => curveGroup.name == obj.animation.position );
				blidgeComponent.curveGroups.rotation = this.blidge.curveGroups.find( curveGroup => curveGroup.name == obj.animation.rotation );
				blidgeComponent.curveGroups.scale = this.blidge.curveGroups.find( curveGroup => curveGroup.name == obj.animation.scale );

				blidgeComponent.curveGroups.uniforms = [];

				// material

				const keys = Object.keys( obj.material.uniforms );

				for ( let i = 0; i < keys.length; i ++ ) {

					const name = keys[ i ];
					const accessor = obj.material.uniforms[ name ];
					const curve = this.blidge.curveGroups.find( curve => curve.name == accessor );

					if ( curve ) {

						blidgeComponent.curveGroups.uniforms.push( {
							name: name,
							curve: curve
						} );

					}

				}

				// mesh

				blidgeComponent.type = type;

				// entity type

				GLP.ECS.removeComponent( this.world, entity, 'geometry' );
				GLP.ECS.removeComponent( this.world, entity, 'material' );
				GLP.ECS.removeComponent( this.world, entity, 'directionalLight' );
				GLP.ECS.removeComponent( this.world, entity, 'spotLight' );
				GLP.ECS.removeComponent( this.world, entity, 'mesh' );

				const uniforms:GLP.Uniforms = {};

				blidgeComponent.curveGroups.uniforms.forEach( item => {

					uniforms[ item.name ] = {
						type: '4fv',
						value: item.curve.value
					};

				} );

				if ( type == 'cube' ) {

					this.factory.appendCube( entity, { name: obj.material.name, uniforms } );

				} else if ( type == 'sphere' ) {

					this.factory.appendSphere( entity, { name: obj.material.name, uniforms } );

				} else if ( type == 'plane' ) {

					this.factory.appendPlane( entity, { name: obj.material.name, uniforms } );

				} else if ( type == 'mesh' ) {

					if ( obj.param ) {

						const param = obj.param as GLP.BLidgeMeshParam;

						const geometry = new GLP.Geometry();
						geometry.setAttribute( 'position', param.position, 3 );
						geometry.setAttribute( 'normal', param.normal, 3 );
						geometry.setAttribute( 'uv', param.uv, 2 );
						geometry.setAttribute( 'index', param.index, 1 );

						this.factory.appendMesh(
							entity,
							geometry.getComponent( this.power ),
							{ name: obj.material.name, uniforms }
						);

					}

				} else if ( type == 'light' ) {

					if ( obj.param ) {

						const param = obj.param as GLP.BLidgeLightParam;

						if ( param.type == 'directional' ) {

							this.factory.appendDirectionalLight( entity, param );

						} else if ( param.type == 'spot' ) {

							this.factory.appendSpotLight( entity, param );

						}

					}

				}

			}

			// transform

			const position = GLP.ECS.getComponent<GLP.ComponentVector3>( this.world, entity, 'position' );

			if ( position ) {

				position.x = obj.position.x;
				position.y = obj.position.y;
				position.z = obj.position.z;

			}

			const quaternion = GLP.ECS.getComponent<GLP.ComponentVector4>( this.world, entity, 'quaternion' );

			if ( quaternion ) {

				let rotXOffset = 0;

				if ( obj.type == 'camera' ) rotXOffset = - Math.PI / 2;

				const rot = {
					x: obj.rotation.x + rotXOffset,
					y: obj.rotation.y,
					z: obj.rotation.z,
				};


				const q = new GLP.Quaternion().setFromEuler( rot, 'YZX' );

				quaternion.x = q.x;
				quaternion.y = q.y;
				quaternion.z = q.z;
				quaternion.w = q.w;

			}

			const scale = GLP.ECS.getComponent<GLP.ComponentVector3>( this.world, entity, 'scale' );

			if ( scale ) {

				scale.x = obj.scale.x;
				scale.y = obj.scale.y;
				scale.z = obj.scale.z;

			}

		} );

		// remove

		GLP.ECS.getEntities( this.world, [ 'blidge' ] ).forEach( entity => {

			const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( this.world, entity, 'blidge' );

			if ( blidgeComponent && blidgeComponent.updateTime !== timeStamp ) {

				this.objects.delete( blidgeComponent.name );

				GLP.ECS.removeEntity( this.world, entity );

			}

		} );

		// scene graph

		blidge.objects.forEach( obj => {

			const entity = this.objects.get( obj.name );
			const parentEntity = this.objects.get( obj.parent );

			if ( entity === undefined ) return;

			this.sceneGraph.add( parentEntity ?? this.root, entity );

		} );

	}

}
