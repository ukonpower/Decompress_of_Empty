import * as GLP from 'glpower';

import { world, globalUniforms, sceneGraph } from "~/ts/Globals";
import { ComponentBLidge, ComponentEvents, ComponentState } from "../../Component";
import { text } from '../Text';
import { appendEvent, createEmpty } from '../Common';

const list = [
	"0b5vr",
	"doxas",
	"mrdoob",
	"gam0022",
	"kanetaaaaa",
	"conspiracy",
	"logicoma",
	"fairlight",
	"ninjadev",
	"ctrl-alt-test",
	"hirai",
	"phi16",
	"fl1ne",
	"jugem-t",
	"sp4ghet",
	"butadiene",
	"kioku",
	"nerumae",
	"zavie",
	"saina",
	"moscowmule",
	"hatsuka",
	"falken",
	"kamoshika",
	"amagi",
	"hadhad",
	"iyoyi",
	"notargs",
	"yosshin",
];

export const greeting = ( entity: GLP.Entity ) => {

	const blidgeComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' );
	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;
	const stateComponent = GLP.ECS.getComponent<ComponentState>( world, entity, 'state' )!;

	const uniforms = GLP.UniformsUtils.merge( globalUniforms.time, globalUniforms.resolution, blidgeComponent ? blidgeComponent.uniforms : {} );

	const textList: {
		entity: GLP.Entity,
		state: ComponentState,
		event: ComponentEvents,
		position: GLP.ComponentVector3,
		uniforms: GLP.Uniforms,
		name: string;
	}[] = [];

	for ( let i = 0; i < list.length; i ++ ) {

		let n = list[ i ];

		let { entity: textEntity, uniforms } = text( appendEvent( createEmpty( {
			position: {
				x: ( Math.random() - 0.5 ) * 20.0 - n.length * 0.3,
				y: ( Math.random() - 0.5 ) * 15 * 3.0,
				z: Math.random() * 0.0,
			},
			scale: {
				x: 0.5,
				y: 0.5,
				z: 0.5,
			}
		} ) ), n, { defines: { IS_FRONT: "", IS_EMISSION: "", IS_GREETING: "" }, uniforms: { uAnimTime: {
			value: i / list.length * 2.0,
			type: '1f'
		} } } );

		sceneGraph.add( entity, textEntity );

		textList.push( {
			name: n,
			entity: textEntity,
			state: GLP.ECS.getComponent<ComponentState>( world, textEntity, 'state' )!,
			event: GLP.ECS.getComponent<ComponentEvents>( world, textEntity, 'events' )!,
			position: GLP.ECS.getComponent<GLP.ComponentVector3>( world, textEntity, 'position' )!,
			uniforms,
		} );

	}

	eventComponent.onUpdate.push( ( e ) => {

		for ( let i = 0; i < textList.length; i ++ ) {

			let text = textList[ i ];

			text.uniforms.uAnimTime.value += e.deltaTime * 0.5;

			if ( text.uniforms.uAnimTime.value > 1.0 ) {

				text.state.visible = false;

			}

			if ( text.uniforms.uAnimTime.value > 2.0 ) {

				text.state.visible = stateComponent.visible;
				text.uniforms.uAnimTime.value -= 2.0;
				text.position.x = ( Math.random() - 0.5 ) * 18.0 - text.name.length * 0.15;
				text.position.y = ( Math.random() - 0.5 ) * 15.0 + 2.5;

			}

			text.state.visible = text.state.visible && stateComponent.visible;

			for ( let j = 0; j < text.event.onUpdate.length; j ++ ) {

				text.event.onUpdate[ j ]( e );

			}

		}

	} );

	eventComponent.onDispose.push( () => {

		for ( let i = 0; i < textList.length; i ++ ) {

			let text = textList[ i ];

			sceneGraph.remove( entity, text.entity );

			let ee = GLP.ECS.getComponent<ComponentEvents>( world, text.entity, "events" );

			if ( ee ) {

				ee.onDispose.forEach( d=>d() );

			}

			GLP.ECS.removeEntity( world, text.entity );

		}

	} );


};
