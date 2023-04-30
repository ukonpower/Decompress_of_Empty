import * as GLP from 'glpower';
import { ComponentCamera, ComponentMatrix, ComponentShadowmapCamera, ComponentCameraPerspective, ComponentCameraOrthographic } from '../../Component';

export class CameraSystem extends GLP.System {

	private size: GLP.Vector;
	private lightOffsetQuaternion: GLP.Quaternion;

	constructor() {

		super( {
			perspectiveCamera: [ "camera", "perspective" ],
			orthographicCamera: [ "camera", "orthographic" ]
		} );

		this.size = new GLP.Vector();

		this.lightOffsetQuaternion = new GLP.Quaternion().setFromEuler( { x: - Math.PI / 2, y: 0, z: 0 } );

	}

	protected updateImpl( logicName: string, entity: number, event: GLP.SystemUpdateEvent ): void {

		const camera = GLP.ECS.getComponent<ComponentCamera>( event.world, entity, 'camera' )!;
		const matrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, entity, 'matrix' );
		const light = GLP.ECS.getComponent<ComponentShadowmapCamera>( event.world, entity, 'renderCameraShadowMap' );

		if ( matrix ) {

			if ( light ) {

				camera.viewMatrix.copy( matrix.world ).applyQuaternion( this.lightOffsetQuaternion ).inverse();

			} else {

				camera.viewMatrix.copy( matrix.world ).inverse();

			}

		}

		if ( camera.needsUpdate === undefined ) {

			this.resizeCamera( entity, event.world );

		}

		if ( camera.needsUpdate ) {

			if ( logicName == 'perspectiveCamera' ) {

				const perspective = GLP.ECS.getComponent<ComponentCameraPerspective>( event.world, entity, 'perspective' )!;
				camera.projectionMatrix.perspective( perspective.fov, camera.aspectRatio, camera.near, camera.far );

			}

			if ( logicName == 'orthographicCamera' ) {

				const orthographic = GLP.ECS.getComponent<ComponentCameraOrthographic>( event.world, entity, 'orthographic' )!;
				camera.projectionMatrix.orthographic( orthographic.width, orthographic.height, camera.near, camera.far );

			}

			camera.needsUpdate = false;

		}

	}

	private resizeCamera( cameraEntity: GLP.Entity, world: GLP.World ) {

		const camera = GLP.ECS.getComponent<ComponentCamera>( world, cameraEntity, 'camera' );

		if ( camera ) {

			camera.aspectRatio = this.size.x / this.size.y;
			camera.needsUpdate = true;

		}

	}

	public resize( world: GLP.World, size: GLP.Vector ) {

		this.size.copy( size );

		// camera

		const cameraEntities = GLP.ECS.getEntities( world, [ 'camera' ] );

		cameraEntities.forEach( camera => {

			this.resizeCamera( camera, world );

		} );


	}

}
