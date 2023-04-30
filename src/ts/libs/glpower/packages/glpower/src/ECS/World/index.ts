import { Component } from "../Component";
import { Entity } from "../Entity";
import { System } from "../System";

export interface World {
	elapsedTime: number;
	lastUpdateTime: number;
	entitiesTotalCount: number;
	entities: Entity[];
	components: Map<string, ( Component | undefined )[]>;
	systems: Map<string, System>;
}
