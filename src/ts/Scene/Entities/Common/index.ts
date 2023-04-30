import * as GLP from 'glpower';

import { world } from '~/ts/Globals';
import { ComponentMatrix, ComponentSceneNode, ComponentEvents, ComponentState } from '../../Component';

export interface EmptyProps {
	position?: GLP.IVector3;
	rotation?: GLP.IVector3;
	scale?: GLP.IVector3;
}

export const appendEmpty = ( entity: GLP.Entity, props: EmptyProps = {} ) => {

	GLP.ECS.addComponent<ComponentState>( world, entity, 'state', { visible: true } );
	GLP.ECS.addComponent<GLP.ComponentVector3>( world, entity, 'position', props.position ?? { x: 0, y: 0, z: 0 } );
	GLP.ECS.addComponent<GLP.ComponentVector3>( world, entity, 'rotation', props.rotation ?? { x: 0, y: 0, z: 0 } );
	GLP.ECS.addComponent<GLP.ComponentVector4>( world, entity, 'quaternion', { x: 0, y: 0, z: 0, w: 1 } );
	GLP.ECS.addComponent<GLP.ComponentVector3>( world, entity, 'scale', props.scale ?? { x: 1, y: 1, z: 1 } );
	GLP.ECS.addComponent<ComponentMatrix>( world, entity, 'matrix', { local: new GLP.Matrix(), world: new GLP.Matrix() } );
	GLP.ECS.addComponent<ComponentSceneNode>( world, entity, 'sceneNode', { children: [] } );

	return entity;

};

export const createEmpty = ( props?: EmptyProps ) => {

	let entity = GLP.ECS.createEntity( world );

	return appendEmpty( entity, props );

};

export const appendEvent = ( entity: GLP.Entity ) => {

	GLP.ECS.addComponent<ComponentEvents>( world, entity, "events", {
		onResize: [],
		onUpdate: [],
		onUpdateBlidgeFrame: [],
		onUpdateBlidgeScene: [],
		onBeforeCalcMatrix: [],
		onAfterCalcMatrix: [],
		onDispose: []
	} );

	return entity;

};
