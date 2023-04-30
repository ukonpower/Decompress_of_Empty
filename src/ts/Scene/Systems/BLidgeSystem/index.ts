import * as GLP from 'glpower';
import { blidge, BPM, globalUniforms, sceneGraph, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentCamera, ComponentCameraPerspective, ComponentEvents } from '../../Component';
import { entityRouter, materialRouter } from '../../Entities/router';
import { appendBlidgeObject, appendGeometryBLidge } from '../../Entities/BLidgeObject';
import { appendEmpty, appendEvent } from '../../Entities/Common';
import { appendDirectionalLight, appendSpotLight } from '../../Entities/Light';

import SceneData from '/assets/scene.json';

export class BLidgeSystem extends GLP.System {

	private root: GLP.Entity;
	private camera: GLP.Entity;
	private objects: Map<string, GLP.Entity>;

	// frame

	private playing: boolean;
	private playTime: number;

	constructor( root: GLP.Entity, camera: GLP.Entity ) {

		super( {
			move: [ 'blidge' ]
		} );

		this.root = root;
		this.camera = camera;
		this.objects = new Map();

		// state

		this.playing = false;
		this.playTime = 0;

		// blidge

		blidge.on( 'sync/scene', this.onSyncScene.bind( this ) );

		blidge.on( 'sync/timeline', ( frame: GLP.BLidgeSceneFrame ) => {

			globalUniforms.time.uTimeSeq.value = frame.current / 30 - 8 * ( 60 / BPM );
			globalUniforms.beat.uBeat.value = globalUniforms.time.uTimeSeq.value / 60 * BPM;
			globalUniforms.beat.uBeat2.value = globalUniforms.beat.uBeat.value / 2;
			globalUniforms.beat.uBeat4.value = globalUniforms.beat.uBeat2.value / 2;
			globalUniforms.beat.uBeat8.value = globalUniforms.beat.uBeat4.value / 2;
			globalUniforms.beat.uBeat4Exp.value = Math.floor( globalUniforms.beat.uBeat4.value ) + ( 1.0 - Math.exp( ( globalUniforms.beat.uBeat4.value % 1 ) * - 5.0 ) );
			globalUniforms.beat.uBeat8Exp.value = Math.floor( globalUniforms.beat.uBeat8.value ) + ( 1.0 - Math.exp( ( globalUniforms.beat.uBeat8.value % 1 ) * - 5.0 ) );

			// update frame

			this.dispatchBlidgeEvent( ( c, blidgeObject ) => {

				for ( let i = 0; i < c.onUpdateBlidgeFrame.length; i ++ ) {

					c.onUpdateBlidgeFrame[ i ]( blidge, blidgeObject );

				}

			} );

			this.emit( 'seek', [ frame.current / frame.fps, frame.playing ] );

		} );

		if ( process.env.NODE_ENV == "development" ) {

			blidge.connect( 'ws://localhost:3100' );

			blidge.on( 'error', () => {

				blidge.loadScene( SceneData );

			} );

		} else {

			blidge.loadScene( SceneData );

		}

	}

	private onSyncScene( blidge: GLP.BLidge ) {

		const timeStamp = new Date().getTime();

		// create entity

		blidge.objects.forEach( blidgeObject => {

			const type = blidgeObject.type;
			let entity = this.objects.get( blidgeObject.name );

			if ( entity !== undefined ) {

				let eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' );

				if ( eventComponent ) eventComponent.onDispose.forEach( d => d() );

				// init events

				if ( type != 'camera' ) {

					appendEvent( entity );

				}

			} else {

				if ( type == 'camera' ) {

					entity = this.camera;

				} else {

					entity = GLP.ECS.createEntity( world );
					appendEmpty( entity );
					appendEvent( entity );

				}

			}

			// append blidge

			let blidgeComponent = appendBlidgeObject( entity, blidgeObject );
			blidgeComponent.updateTime = timeStamp;

			this.objects.set( blidgeObject.name, entity );

			// entity type

			GLP.ECS.removeComponent( world, entity, 'geometry' );
			GLP.ECS.removeComponent( world, entity, 'material' );
			GLP.ECS.removeComponent( world, entity, 'directionalLight' );
			GLP.ECS.removeComponent( world, entity, 'spotLight' );
			GLP.ECS.removeComponent( world, entity, 'mesh' );

			if ( type == 'cube' || type == 'sphere' || type == 'plane' || type == "mesh" || type == "cylinder" ) {

				appendGeometryBLidge( entity, blidgeObject );

			} else if ( type == 'light' ) {

				if ( blidgeObject.param ) {

					const param = blidgeObject.param as GLP.BLidgeLightParam;

					if ( param.type == 'directional' ) {

						appendDirectionalLight( entity, param );

					} else if ( param.type == 'spot' ) {

						appendSpotLight( entity, param );

					}

				}

			} else if ( type == 'camera' ) {

				const componentPerspective = GLP.ECS.getComponent<ComponentCameraPerspective>( world, entity, 'perspective' );
				const componentCamera = GLP.ECS.getComponent<ComponentCamera>( world, entity, 'camera' );
				const componentEvents = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

				if ( componentPerspective && blidgeObject.param ) {

					componentPerspective.fov = ( blidgeObject.param as GLP.BLidgeCameraParam ).fov;

				}

				if ( componentCamera ) {

					componentCamera.needsUpdate = true;

				}

				componentEvents.inited = false;

			}

			// append custom entity

			entityRouter( entity, blidgeObject );

			materialRouter( entity, blidgeObject );

			// transform

			const position = GLP.ECS.getComponent<GLP.ComponentVector3>( world, entity, 'position' );

			if ( position ) {

				position.x = blidgeObject.position.x;
				position.y = blidgeObject.position.y;
				position.z = blidgeObject.position.z;

			}

			const quaternion = GLP.ECS.getComponent<GLP.ComponentVector4>( world, entity, 'quaternion' );

			if ( quaternion ) {

				let rotXOffset = 0;

				if ( blidgeObject.type == 'camera' ) rotXOffset = - Math.PI / 2;

				const rot = {
					x: blidgeObject.rotation.x + rotXOffset,
					y: blidgeObject.rotation.y,
					z: blidgeObject.rotation.z,
				};

				const q = new GLP.Quaternion().setFromEuler( rot, 'YZX' );

				quaternion.x = q.x;
				quaternion.y = q.y;
				quaternion.z = q.z;
				quaternion.w = q.w;

			}

			const scale = GLP.ECS.getComponent<GLP.ComponentVector3>( world, entity, 'scale' );

			if ( scale ) {

				scale.x = blidgeObject.scale.x;
				scale.y = blidgeObject.scale.y;
				scale.z = blidgeObject.scale.z;

			}

		} );

		// remove

		GLP.ECS.getEntities( world, [ 'blidge' ] ).forEach( entity => {

			const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' );

			if ( blidgeComponent && blidgeComponent.updateTime !== timeStamp ) {

				let eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' );

				if ( eventComponent ) eventComponent.onDispose.forEach( d => d() );

				this.objects.delete( blidgeComponent.object.name );

				GLP.ECS.removeEntity( world, entity );

			}

		} );

		// scene graph

		blidge.objects.forEach( obj => {

			const entity = this.objects.get( obj.name );
			const parentEntity = this.objects.get( obj.parent );

			if ( entity === undefined ) return;

			sceneGraph.add( parentEntity ?? this.root, entity );

		} );

		// dispatch event

		this.dispatchBlidgeEvent( ( c, blidgeObject ) => {

			for ( let i = 0; i < c.onUpdateBlidgeScene.length; i ++ ) {

				c.onUpdateBlidgeScene[ i ]( blidge, blidgeObject );

			}

		} );

		this.dispatchBlidgeEvent( ( c, blidgeObject ) => {

			for ( let i = 0; i < c.onUpdateBlidgeFrame.length; i ++ ) {

				c.onUpdateBlidgeFrame[ i ]( blidge, blidgeObject );

			}

		} );

	}

	private dispatchBlidgeEvent( cb: ( eventComponent: ComponentEvents, blidgeObject: GLP.BLidgeObject ) => void ) {

		const entities = GLP.ECS.getEntities( world, [ 'events', 'blidge' ] );

		for ( let i = 0; i < entities.length; i ++ ) {

			let eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entities[ i ], 'events' )!;
			let blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entities[ i ], 'blidge' )!;

			cb( eventComponent, blidgeComponent.object );

		}

	}

	public update( event: GLP.SystemUpdateEvent ): void {

		if ( this.playing ) {

			blidge.setFrame( this.playTime * blidge.frame.fps );
			this.playTime += event.deltaTime;

		}

		super.update( event );

	}

	public play() {

		this.playing = true;
		this.playTime = 0;

	}

}
