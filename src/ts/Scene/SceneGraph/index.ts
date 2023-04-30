import * as GLP from 'glpower';
import { world } from '~/ts/Globals';
import { ComponentSceneNode } from '../Component';

export class SceneGraph {

	private entities: GLP.Entity[];

	private cacheTransformUpdateOrder: GLP.Entity[] | null;
	private cacheRenderOrder: GLP.Entity[] | null;

	constructor( ) {

		this.entities = [];

		this.cacheTransformUpdateOrder = null;
		this.cacheRenderOrder = null;

	}

	public add( parent: GLP.Entity, child: GLP.Entity ) {

		const parentNode = GLP.ECS.getComponent<ComponentSceneNode>( world, parent, 'sceneNode' );

		if ( parentNode === null ) {

			console.log( 'parent not exists.' );

			return;

		}

		const childNode = GLP.ECS.getComponent<ComponentSceneNode>( world, child, 'sceneNode' );

		if ( childNode === null ) {

			console.log( 'children not exists.' );

			return;

		}

		if ( childNode.parent !== undefined ) {

			this.remove( childNode.parent, child );

		}

		parentNode.children.push( child );
		childNode.parent = parent;

		this.entities = Array.from( new Set( [ parent, child, ...this.entities ] ) );

		this.cacheTransformUpdateOrder = null;

	}

	public remove( parent: GLP.Entity, child: GLP.Entity ) {

		const parentNode = GLP.ECS.getComponent<ComponentSceneNode>( world, parent, 'sceneNode' );

		if ( parentNode === null ) {

			console.log( 'parent not exists.' );

			return;

		}

		const childNode = GLP.ECS.getComponent<ComponentSceneNode>( world, child, 'sceneNode' );

		if ( childNode === null ) {

			console.log( 'children not exists.' );

			return;

		}

		// remove from parent

		let i = parentNode.children.findIndex( entity => entity == child );

		if ( i > - 1 ) {

			parentNode.children.splice( i, 1 );

		}

		childNode.parent = undefined;

		// remove from entity array

		i = this.entities.findIndex( entity => entity === child );

		if ( i > - 1 ) {

			this.entities.splice( i, 1 );

		}

		this.cacheTransformUpdateOrder = null;

	}

	public getTransformUpdateOrder() {

		if ( this.cacheTransformUpdateOrder ) return this.cacheTransformUpdateOrder;

		const updateOrder: GLP.Entity[] = [];

		const _ = ( entity: GLP.Entity ) => {

			updateOrder.push( entity );

			const sceneNode = GLP.ECS.getComponent<ComponentSceneNode>( world, entity, 'sceneNode' );

			if ( sceneNode ) {

				for ( let i = 0; i < sceneNode.children.length; i ++ ) {

					_( sceneNode.children[ i ] );

				}

			}

		};

		for ( let i = 0; i < this.entities.length; i ++ ) {

			const entity = this.entities[ i ];

			const sceneNode = GLP.ECS.getComponent<ComponentSceneNode>( world, entity, 'sceneNode' );

			if ( sceneNode && sceneNode.parent === undefined ) {

				_( entity );

			}


		}

		this.cacheTransformUpdateOrder = updateOrder;

		return updateOrder;

	}


}
