import * as GLP from 'glpower';
import { Pointer, PointerEventArgs } from '../../Pointer';

export class OrbitControlSystem extends GLP.System {

	private pointer: Pointer;
	private offsetRot: GLP.Vector;

	constructor( targetElm: HTMLCanvasElement ) {

		super( {
			perspectiveCamera: [ "camera", "mainCamera", "matrix", "position", "quaternion" ],
		} );

		this.pointer = new Pointer();
		this.offsetRot = new GLP.Vector();

		this.pointer.registerElement( targetElm );

		let touching = false;

		this.pointer.on( "start", ( e: PointerEventArgs ) => {

			if ( touching ) return;

			touching = true;

		} );

		this.pointer.on( "move", ( e: PointerEventArgs ) => {

			if ( ! touching ) return;

			this.offsetRot.add( { x: e.delta.x * 0.003, y: e.delta.y * 0.003 } );

		} );

		this.pointer.on( "end", ( e: PointerEventArgs ) => {

			if ( ! touching ) return;

			touching = false;

			this.offsetRot.set( 0, 0 );

		} );

	}

	protected updateImpl( logicName: string, entity: number, event: GLP.SystemUpdateEvent ): void {

		let positionComponent = GLP.ECS.getComponent<GLP.ComponentVector3>( event.world, entity, 'position' )!;
		let rotComponent = GLP.ECS.getComponent<GLP.ComponentVector4>( event.world, entity, 'quaternion' )!;

		let pos = new GLP.Vector().copy( positionComponent );
		pos.w = 1.0;

		let qua = new GLP.Quaternion().copy( rotComponent );

		let offsetPos = new GLP.Vector( this.offsetRot.x, - this.offsetRot.y, 0.0, 1.0 );
		offsetPos.applyMatrix4( new GLP.Matrix().applyQuaternion( qua ) );

		pos.applyMatrix4( new GLP.Matrix().applyPosition( offsetPos ) );

		positionComponent.x = pos.x;
		positionComponent.y = pos.y;
		positionComponent.z = pos.z;

		rotComponent.x = qua.x;
		rotComponent.y = qua.y;
		rotComponent.z = qua.z;
		rotComponent.w = qua.w;

	}


}
