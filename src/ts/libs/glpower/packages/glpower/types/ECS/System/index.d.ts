import { ECSUpdateEvent } from "..";
import { EventEmitter } from "../../utils/EventEmitter";
import { ComponentName } from "../Component";
import { Entity } from "../Entity";
export declare type EntityQuery = ComponentName[];
export interface SystemUpdateEvent extends ECSUpdateEvent {
}
export declare class System extends EventEmitter {
    protected queries: {
        name: string;
        query: EntityQuery;
    }[];
    constructor(queries?: {
        [key: string]: EntityQuery;
    });
    update(event: SystemUpdateEvent): void;
    protected beforeUpdateImpl(logicName: string, event: SystemUpdateEvent, entities: Entity[]): void;
    protected updateImpl(logicName: string, entity: Entity, event: SystemUpdateEvent): void;
    protected afterUpdateImpl(logicName: string, event: SystemUpdateEvent): void;
    dispose(): void;
}
//# sourceMappingURL=index.d.ts.map