import * as GLP from 'glpower';
import { sceneGraph } from '~/ts/Globals';
import { ComponentSceneNode, ComponentMatrix, ComponentEvents } from '../../Component';

export class TransformSystem extends GLP.System {

	constructor() {

		super( {
			'': [
				'position',
				"scale",
				"matrix",
			]
		} );

	}

	public update( event: GLP.SystemUpdateEvent ): void {

		const entities = sceneGraph.getTransformUpdateOrder();

		for ( let i = 0; i < entities.length; i ++ ) {

			const entity = entities[ i ];

			this.updateImpl( '_', entity, event );

		}

	}

	protected updateImpl( logicName: string, entity: number, event: GLP.SystemUpdateEvent ): void {

		const eventsComponent = GLP.ECS.getComponent<ComponentEvents>( event.world, entity, 'events' );
		const sceneNode = GLP.ECS.getComponent<ComponentSceneNode>( event.world, entity, 'sceneNode' );
		const matrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, entity, 'matrix' );
		const position = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, entity, 'position' );
		const quaternion = GLP.ECS.getComponent<GLP.ComponentVector4>( event.world, entity, 'quaternion' );
		const scale = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, entity, 'scale' );

		// event

		if ( event.systemName == "main_transform" && eventsComponent ) {

			eventsComponent.onBeforeCalcMatrix.forEach( f => {

				f( event );

			} );

		}

		if ( ! position || ! scale || ! matrix || ! quaternion ) return;

		// calc self matrix

		matrix.local.setFromTransform( position, quaternion, scale );
		matrix.world.copy( matrix.local );

		// parent

		if ( sceneNode && sceneNode.parent !== undefined ) {

			const parentMatrix = GLP.ECS.getComponent<ComponentMatrix>( event.world, sceneNode.parent, 'matrix' );

			if ( parentMatrix ) {

				matrix.world.preMultiply( parentMatrix.world );

			}

		}

		if ( event.systemName == "main_transform" && eventsComponent ) {

			eventsComponent.onAfterCalcMatrix.forEach( f => {

				f( event );

			} );

		}

	}

}
