import * as GLP from 'glpower';

import { blidge, power, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentEvents, ComponentGeometry, ComponentState } from '../../Component';
import { disposeComponentGeometry } from '../../Utils/Disposer';
import { EmptyProps } from '../Common';

export interface BLidgeObjectProps extends EmptyProps {
	blidge: GLP.BLidge,
	blidgeObject: GLP.BLidgeObject,
}

export const appendBlidgeObject = ( entity: GLP.Entity, blidgeObject: GLP.BLidgeObject ) => {

	let blidgeComponent = GLP.ECS.addComponent<ComponentBLidge>( world, entity, 'blidge', {
		object: blidgeObject,
		uniforms: {},
	} );

	const positionComponent = GLP.ECS.getComponent<GLP.ComponentVector3>( world, entity, 'position' )!;
	const scaleComponent = GLP.ECS.getComponent<GLP.ComponentVector3>( world, entity, 'scale' )!;
	const quaternionComponent = GLP.ECS.getComponent<GLP.ComponentVector4>( world, entity, 'quaternion' )!;
	const stateComponent = GLP.ECS.getComponent<ComponentState>( world, entity, 'state' )!;

	const positionCurve = blidge.getCurveGroup( blidgeObject.animation.position );
	const scaleCurve = blidge.getCurveGroup( blidgeObject.animation.scale );
	const rotationCurve = blidge.getCurveGroup( blidgeObject.animation.rotation );
	const hideCurve = blidge.getCurveGroup( blidgeObject.animation.hide );

	stateComponent.visible = blidgeObject.visible;

	// uniforms

	let uniformCurves: {name: string, curve: GLP.FCurveGroup}[] = [];

	const keys = Object.keys( blidgeObject.material.uniforms );

	for ( let i = 0; i < keys.length; i ++ ) {

		const name = keys[ i ];
		const accessor = blidgeObject.material.uniforms[ name ];
		const curve = blidge.curveGroups.find( curve => curve.name == accessor );

		if ( curve ) {

			uniformCurves.push( {
				name: name,
				curve: curve
			} );

			blidgeComponent.uniforms[ name ] = {
				type: '4fv',
				value: curve.value
			};

		}

	}

	// update

	let eventsComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	const tmpQuaternion = new GLP.Quaternion();

	eventsComponent.onUpdate.push( () => {

		const frame = blidge.frame.current;

		if ( positionCurve ) {

			const position = positionCurve.setFrame( frame ).value;

			if ( positionCurve.getFCurve( 'x' ) ) {

				positionComponent.x = position.x;

			}

			if ( positionCurve.getFCurve( 'y' ) ) {

				positionComponent.y = position.y;

			}

			if ( positionCurve.getFCurve( 'z' ) ) {

				positionComponent.z = position.z;

			}

		}

		if ( rotationCurve ) {

			const rot = {
				x: blidgeObject.rotation.x,
				y: blidgeObject.rotation.y,
				z: blidgeObject.rotation.z,
			};
			const rotValue = rotationCurve.setFrame( frame ).value;

			if ( rotationCurve.getFCurve( 'x' ) ) {

				rot.x = rotValue.x;

			}

			if ( rotationCurve.getFCurve( 'y' ) ) {

				rot.y = rotValue.y;

			}

			if ( rotationCurve.getFCurve( 'z' ) ) {

				rot.z = rotValue.z;

			}

			let rotXOffset = 0;

			if ( blidgeObject.type == 'camera' ) rotXOffset = - Math.PI / 2;

			tmpQuaternion.setFromEuler( {
				x: rot.x + rotXOffset,
				y: rot.y,
				z: rot.z
			}, 'YZX' );

			quaternionComponent.x = tmpQuaternion.x;
			quaternionComponent.y = tmpQuaternion.y;
			quaternionComponent.z = tmpQuaternion.z;
			quaternionComponent.w = tmpQuaternion.w;

		}

		if ( scaleCurve ) {

			const scale = scaleCurve.setFrame( frame ).value;

			scaleComponent.x = scale.x;
			scaleComponent.y = scale.y;
			scaleComponent.z = scale.z;

		}

		for ( let i = 0; i < uniformCurves.length; i ++ ) {

			let curve = uniformCurves[ i ];
			blidgeComponent.uniforms[ curve.name ].value = curve.curve.setFrame( frame ).value;

		}

		if ( hideCurve ) {

			stateComponent.visible = hideCurve.setFrame( frame ).value.x < 0.5;


		}

	} );

	return blidgeComponent;

};


export const appendGeometryBLidge = ( entity: GLP.Entity, blidgeObject: GLP.BLidgeObject ) => {

	let geometryComponent: ComponentGeometry | null = null;
	let type = blidgeObject.type;
	let geometryParam = blidgeObject.param as any;

	if ( type == 'cube' ) {

		let x = 1, y = 1, z = 1;

		if ( geometryParam ) {

			x = geometryParam.x;
			y = geometryParam.y;
			z = geometryParam.z;

		}

		geometryComponent = new GLP.CubeGeometry( x, y, z ).getComponent( power );

	} else if ( type == 'sphere' ) {

		let radius = 1.0;

		if ( geometryParam ) radius = geometryParam.r;

		geometryComponent = new GLP.SphereGeometry( radius ).getComponent( power );

	} else if ( type == 'plane' ) {

		let x = 1, y = 1;

		if ( geometryParam ) {

			x = geometryParam.x;
			y = geometryParam.y;


		}

		geometryComponent = new GLP.PlaneGeometry( x, y ).getComponent( power );

	} else if ( type == 'cylinder' ) {

		geometryComponent = new GLP.CylinderGeometry( 1, 1, 2, 24 ).getComponent( power );

	} else if ( type == 'mesh' ) {

		const geometry = new GLP.Geometry();

		geometry.setAttribute( 'position', geometryParam.position, 3 );
		geometry.setAttribute( 'normal', geometryParam.normal, 3 );
		geometry.setAttribute( 'uv', geometryParam.uv, 2 );
		geometry.setAttribute( 'index', geometryParam.index, 1 );

		geometryComponent = geometry.getComponent( power );

	}

	if ( ! geometryComponent ) return entity;

	GLP.ECS.addComponent<ComponentGeometry>( world, entity, 'geometry', geometryComponent );

	// dispose

	const eventComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventComponent.onDispose.push( () => {

		geometryComponent && disposeComponentGeometry( geometryComponent );

	} );

};
