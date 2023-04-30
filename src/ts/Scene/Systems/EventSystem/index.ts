import * as GLP from 'glpower';
import { ComponentEvents } from '../../Component';

export class EventSystem extends GLP.System {

	private size: GLP.Vector;

	constructor() {

		super( {
			"": [ 'events' ]
		} );

		this.size = new GLP.Vector();

	}

	protected updateImpl( logicName: string, entity: number, event: GLP.SystemUpdateEvent ): void {

		const events = GLP.ECS.getComponent<ComponentEvents>( event.world, entity, 'events' );

		if ( events ) {

			if ( ! events.inited ) {

				this.resize( event.world, this.size );

				events.inited = true;

			}

			for ( let i = 0; i < events.onUpdate.length; i ++ ) {

				events.onUpdate[ i ]( event );

			}

		}

	}

	public resize( world: GLP.World, size: GLP.Vector ) {

		this.size.copy( size );

		const entities = GLP.ECS.getEntities( world, [ 'events' ] );

		entities.forEach( entity => {

			const events = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

			for ( let i = 0; i < events.onResize.length; i ++ ) {

				events.onResize[ i ]( { size } );

			}

		} );

	}

}
