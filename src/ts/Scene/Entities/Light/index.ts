import * as GLP from 'glpower';

import { power, world } from '~/ts/Globals';
import { ComponentCamera, ComponentShadowmapCamera, ComponentEvents, ComponentLightDirectional, ComponentLightSpot, ComponentCameraPerspective, ComponentCameraOrthographic } from "../../Component";

export const appendShadowMap = ( entity: GLP.Entity ) => {

	let gl = power.gl;

	const rtShadowMap = new GLP.GLPowerFrameBuffer( gl );

	const texture = power.createTexture();
	rtShadowMap.setTexture( [ texture ] );

	GLP.ECS.addComponent<ComponentCamera>( world, entity, 'camera', {
		near: 0.01,
		far: 100.0,
		aspectRatio: 1,
		projectionMatrix: new GLP.Matrix(),
		viewMatrix: new GLP.Matrix(),
	} );

	GLP.ECS.addComponent<ComponentShadowmapCamera>( world, entity, 'renderCameraShadowMap', {
		renderTarget: rtShadowMap
	} );

	// events

	let eventsComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	eventsComponent.onResize.push( () => {

		rtShadowMap.setSize( 512, 512 );

	} );

	eventsComponent.onDispose.push( () => {

		texture.dispose();
		rtShadowMap.dispose();

	} );

	return entity;

};

// directionalLight

export const appendDirectionalLight = ( entity: GLP.Entity, param: GLP.BLidgeDirectionalLightParam ) => {

	GLP.ECS.addComponent<ComponentLightDirectional>( world, entity, 'directionalLight', {
		color: new GLP.Vector( param.color.x, param.color.y, param.color.z ).multiply( Math.PI ),
		intensity: param.intensity
	} );


	if ( param.shadowMap ) {

		appendShadowMap( entity );

	}

	GLP.ECS.addComponent<ComponentCameraOrthographic>( world, entity, 'orthographic', {
		width: 40,
		height: 40
	} );

	return entity;

};

// spotLight

export const appendSpotLight = ( entity: GLP.Entity, param: GLP.BLidgeSpotLightParam ) => {

	GLP.ECS.addComponent<ComponentLightSpot>( world, entity, 'spotLight', {
		color: new GLP.Vector( param.color.x, param.color.y, param.color.z ).multiply( Math.PI ),
		intensity: param.intensity,
		angle: param.angle,
		blend: param.blend,
		distance: 30,
		decay: 2
	} );

	if ( param.shadowMap ) {

		appendShadowMap( entity );

	}

	GLP.ECS.addComponent<ComponentCameraPerspective>( world, entity, 'perspective', {
		fov: param.angle / Math.PI * 180,
	} );

	return entity;

};
