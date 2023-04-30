import { Component, ComponentName } from "./Component";
import { Entity } from "./Entity";
import { EntityQuery, System } from "./System";
import { World } from "./World";
export interface ECSUpdateEvent {
    world: World;
    time: number;
    deltaTime: number;
}
export declare namespace ECS {
    const createWorld: () => World;
    const createEntity: (world: World) => Entity;
    const removeEntity: (world: World, entity: Entity) => void;
    const addComponent: <T extends Component>(world: World, entity: Entity, componentName: ComponentName, component: T) => T;
    const removeComponent: (world: World, entity: Entity, componentName: ComponentName) => void;
    const getComponent: <T extends Component>(world: World, entity: Entity, componentName: ComponentName) => T | null;
    const addSystem: <T extends System>(world: World, systemName: string, system: T) => void;
    const removeSystem: (world: World, componentName: ComponentName) => void;
    const update: (world: World) => void;
    const getEntities: (world: World, query: EntityQuery) => Entity[];
}
//# sourceMappingURL=index.d.ts.map