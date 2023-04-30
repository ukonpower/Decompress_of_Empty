import { Component, ComponentName } from "./Component";
import { Entity } from "./Entity";
import { EntityQuery, System } from "./System";
import { World } from "./World";

export interface ECSUpdateEvent {
	world: World,
	time: number,
	deltaTime: number,
}

export namespace ECS {

	export const createWorld = (): World => {

		return {
			elapsedTime: 0,
			lastUpdateTime: new Date().getTime(),
			entitiesTotalCount: 0,
			entities: [],
			components: new Map(),
			systems: new Map()
		};

	};

	// entity

	export const createEntity = ( world: World ): Entity => {

		const entity: Entity = world.entitiesTotalCount ++;

		world.entities.push( entity );

		return entity;

	};

	export const removeEntity = ( world: World, entity: Entity ): void =>{

		const index = world.entities.findIndex( e => e == entity );

		// remove entity

		if ( index > - 1 ) {

			world.entities.slice( index, 1 );

		}

		// remove components

		world.components.forEach( component => {

			component[ entity ] = undefined;

		} );

	};

	// component

	export const addComponent = <T extends Component >( world: World, entity: Entity, componentName: ComponentName, component: T ): T => {

		let componentArray = world.components.get( componentName );

		if ( componentArray === undefined ) {

			componentArray = [];

			world.components.set( componentName, componentArray );

		}

		if ( componentArray.length < entity + 1 ) {

			componentArray.length = entity + 1;

		}

		componentArray[ entity ] = component;

		return component;

	};

	export const removeComponent = ( world: World, entity: Entity, componentName: ComponentName ) => {

		const componentArray = world.components.get( componentName );

		if ( componentArray && componentArray.length > entity ) {

			componentArray[ entity ] = undefined;

		}

	};

	export const getComponent = <T extends Component >( world: World, entity: Entity, componentName: ComponentName ): T | null => {

		const component = world.components.get( componentName );

		if ( component !== undefined ) {

			return ( component[ entity ] ) as T;

		}

		return null;

	};

	// system

	export const addSystem = <T extends System >( world: World, systemName: string, system: T ) => {

		world.systems.set( systemName, system );

	};

	export const removeSystem = ( world: World, componentName: ComponentName ) => {

		world.systems.delete( componentName );

	};

	// update

	export const update = ( world: World ) => {

		const now = new Date().getTime();
		const deltaTime = ( now - world.lastUpdateTime ) / 1000;
		world.elapsedTime += deltaTime;
		world.lastUpdateTime = now;

		const systemList = world.systems;

		systemList.forEach( ( system, systemName ) => {

			system.update( {
				systemName,
				world,
				deltaTime,
				time: world.elapsedTime,
			} );

		} );

	};

	// entities

	export const getEntities = ( world: World, query: EntityQuery ): Entity[] => {

		const entities = world.entities.filter( entt => {

			for ( let i = 0; i < query.length; i ++ ) {

				const componentName = query[ i ];

				const component = world.components.get( componentName );

				if ( component === undefined || component[ entt ] === undefined ) {

					return false;

				}

			}

			return true;

		} );

		return entities;

	};

}
