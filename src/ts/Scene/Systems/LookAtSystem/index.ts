import * as GLP from 'glpower';
import { ComponentLookAt, ComponentMatrix } from '../../Component';


export class LookAtSystem extends GLP.System {

	private up: GLP.Vector;
	private tmpPos1: GLP.Vector;
	private tmpPos2: GLP.Vector;
	private tmpQua: GLP.Quaternion;
	private tmpMatrix: GLP.Matrix;

	constructor() {

		super( {
			perspectiveCamera: [ "lookAt", "position", "quaternion", 'matrix' ],
		} );

		this.up = new GLP.Vector( 0.0, 1.0, 0.0 );
		this.tmpPos1 = new GLP.Vector();
		this.tmpPos2 = new GLP.Vector();
		this.tmpMatrix = new GLP.Matrix();
		this.tmpQua = new GLP.Quaternion();

	}

	protected updateImpl( logicName: string, entity: number, event: GLP.SystemUpdateEvent ): void {

		const matrixComponent = GLP.ECS.getComponent<ComponentMatrix>( event.world, entity, 'matrix' )!;
		const lookAtComponent = GLP.ECS.getComponent<ComponentLookAt>( event.world, entity, 'lookAt' )!;
		const quaternionComponent = GLP.ECS.getComponent<GLP.ComponentVector4>( event.world, entity, 'quaternion' )!;

		// target

		if ( lookAtComponent.target === undefined || lookAtComponent.enable != true ) return;

		const targetMatrixComponent = GLP.ECS.getComponent<ComponentMatrix>( event.world, lookAtComponent.target, 'matrix' );

		if ( ! targetMatrixComponent ) return;

		// calc

		matrixComponent.world.decompose( this.tmpPos1 );
		targetMatrixComponent.world.decompose( this.tmpPos2 );

		this.tmpQua.setFromMatrix( this.tmpMatrix.lookAt( this.tmpPos1, this.tmpPos2, this.up ) );

		quaternionComponent.x = this.tmpQua.x;
		quaternionComponent.y = this.tmpQua.y;
		quaternionComponent.z = this.tmpQua.z;
		quaternionComponent.w = this.tmpQua.w;

	}

}
