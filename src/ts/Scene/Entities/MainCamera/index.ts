import * as GLP from 'glpower';

import { gl, globalUniforms, power, world } from '~/ts/Globals';
import { ComponentBLidge, ComponentCamera, ComponentCameraPerspective, ComponentEvents, ComponentLookAt, ComponentRenderCamera, PostProcessPass } from '../../Component';

import quadVert from '~/ts/shaders/quad.vs';

import deferredShadingFrag from '~/ts/shaders/deferredShading.fs';
import lightShaftFrag from '~/ts/shaders/lightShaft.fs';
import ssrFrag from '~/ts/shaders/ssr.fs';
import deferredCompositeFrag from '~/ts/shaders/deferredComposite.fs';

export type MainCameraProps = {
	near: number,
	far: number,
	fov: number,
	rt: {
		gBuffer: GLP.GLPowerFrameBuffer,
		output: GLP.GLPowerFrameBuffer,
	}
}

export const appendMainCamera = ( entity: GLP.Entity, props: MainCameraProps ) => {

	GLP.ECS.addComponent<{}>( world, entity, 'mainCamera', {} );

	let cameraComponent = GLP.ECS.addComponent<ComponentCamera>( world, entity, 'camera', {
		near: props.near ?? 0.001,
		far: props.far ?? 1000,
		aspectRatio: 1,
		projectionMatrix: new GLP.Matrix(),
		viewMatrix: new GLP.Matrix(),
	} );

	let perspectiveComponent = GLP.ECS.addComponent<ComponentCameraPerspective>( world, entity, 'perspective', {
		fov: props.fov ?? 50,
	} );

	/*-------------------------------
		Deffered
	-------------------------------*/

	let gBuffer = props.rt.gBuffer.textures;

	const rtDeferredShading = new GLP.GLPowerFrameBuffer( gl, { disableDepthBuffer: true } );
	rtDeferredShading.setTexture( [ power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR, generateMipmap: true } ) ] );

	const resolution = new GLP.Vector();
	const resolutionInv = new GLP.Vector();

	// shading

	const deferredShading: PostProcessPass = {
		name: 'shading',
		input: props.rt.gBuffer.textures,
		vertexShader: quadVert,
		fragmentShader: deferredShadingFrag,
		renderTarget: rtDeferredShading,
		uniforms: globalUniforms.time,
		camera: entity,
		useLight: true,
	};

	// light shaft

	let rtLightShaft1 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
		power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
	] );

	let rtLightShaft2 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
		power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
	] );

	const lightShaft: PostProcessPass = {
		name: 'rightshaft',
		input: gBuffer,
		vertexShader: quadVert,
		fragmentShader: lightShaftFrag,
		renderTarget: rtLightShaft1,
		camera: entity,
		useLight: true,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
			uLightShaftBackBuffer: {
				value: rtLightShaft2.textures[ 0 ],
				type: '1i'
			},
		} )
	};

	// ssr

	let rtSSR1 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
		power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
	] );

	let rtSSR2 = new GLP.GLPowerFrameBuffer( gl ).setTexture( [
		power.createTexture().setting( { magFilter: gl.LINEAR, minFilter: gl.LINEAR } ),
	] );

	const ssr: PostProcessPass = {
		name: 'ssr',
		input: [ gBuffer[ 0 ], gBuffer[ 1 ] ],
		vertexShader: quadVert,
		fragmentShader: ssrFrag,
		renderTarget: rtSSR1,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
			uResolution: {
				value: resolution,
				type: '2fv',
			},
			uResolutionInv: {
				value: resolutionInv,
				type: '2fv',
			},
			uSceneTex: {
				value: rtDeferredShading.textures[ 0 ],
				type: '1i'
			},
			uSSRBackBuffer: {
				value: rtSSR2.textures[ 0 ],
				type: '1i'
			},
		} ),
		camera: entity,
	};

	// composite

	const composite: PostProcessPass = {
		name: 'composite',
		input: rtDeferredShading.textures,
		vertexShader: quadVert,
		fragmentShader: deferredCompositeFrag,
		renderTarget: props.rt.output,
		uniforms: GLP.UniformsUtils.merge( globalUniforms.time, {
			uLightShaftTexture: {
				value: rtLightShaft2.textures[ 0 ],
				type: '1i'
			},
			uSSRTexture: {
				value: rtSSR2.textures[ 0 ],
				type: '1i'
			},
		} )
	};

	 GLP.ECS.addComponent<ComponentRenderCamera>( world, entity, 'renderCameraDeferred',
		{
			renderTarget: props.rt.gBuffer,
			postprocess: [ deferredShading, lightShaft, ssr, composite ],
		},
	);

	/*-------------------------------
		Forward
	-------------------------------*/

	GLP.ECS.addComponent<ComponentRenderCamera>( world, entity, 'renderCameraForward', {
		renderTarget: props.rt.output,
	} );

	/*-------------------------------
		Lookat
	-------------------------------*/

	const lookAtComponent = GLP.ECS.addComponent<ComponentLookAt>( world, entity, 'lookAt', {} );

	/*-------------------------------
		Events
	-------------------------------*/

	let eventsComponent = GLP.ECS.getComponent<ComponentEvents>( world, entity, 'events' )!;

	// update scene

	eventsComponent.onUpdateBlidgeScene.push( ( blidge, blidgeObject ) => {

		let blidgeComponents = world.components.get( 'blidge' ) || [];

		let ukp = blidgeComponents.findIndex( ( item ) => {

			return item && ( item as ComponentBLidge ).object.name == 'UKP';

		} );

		if ( ukp !== undefined ) {

			lookAtComponent.target = ukp;

		}

	} );

	// update

	eventsComponent.onUpdate.push( ( e ) => {

		// light shaft swap

		let tmp = rtLightShaft1;
		rtLightShaft1 = rtLightShaft2;
		rtLightShaft2 = tmp;

		lightShaft.renderTarget = rtLightShaft1;

		if ( lightShaft.uniforms && composite.uniforms ) {

			composite.uniforms.uLightShaftTexture.value = rtLightShaft1.textures[ 0 ];
			lightShaft.uniforms.uLightShaftBackBuffer.value = rtLightShaft2.textures[ 0 ];

		}

		// ssr swap

		tmp = rtSSR1;
		rtSSR1 = rtSSR2;
		rtSSR2 = tmp;

		ssr.renderTarget = rtSSR1;

		if ( ssr.uniforms && composite.uniforms ) {

			composite.uniforms.uSSRTexture.value = rtSSR1.textures[ 0 ];
			ssr.uniforms.uSSRBackBuffer.value = rtSSR2.textures[ 0 ];

		}

	} );

	// before Transform

	let quaternionComponent = GLP.ECS.getComponent<GLP.IVector4>( world, entity, 'quaternion' )!;

	eventsComponent.onBeforeCalcMatrix.push( ( event ) => {

		// shake

		let tmpQuaternion = new GLP.Quaternion();
		let shakeQuaternion = new GLP.Quaternion();

		let shakeW = 0.005;

		shakeW *= ( perspectiveComponent ? perspectiveComponent.fov : 50 ) / 50.0;

		shakeQuaternion.setFromEuler( { x: Math.sin( event.time * 2.0 ) * shakeW, y: Math.sin( event.time * 2.5 ) * shakeW, z: 0 } );

		tmpQuaternion.copy( quaternionComponent );
		tmpQuaternion.multiply( shakeQuaternion );

		quaternionComponent.x = tmpQuaternion.x;
		quaternionComponent.y = tmpQuaternion.y;
		quaternionComponent.z = tmpQuaternion.z;
		quaternionComponent.w = tmpQuaternion.w;

	} );

	globalUniforms.camera.projectionMatrix.value = cameraComponent.projectionMatrix;
	globalUniforms.camera.viewMatrix.value = cameraComponent.viewMatrix;

	eventsComponent.onAfterCalcMatrix.push( ( event ) => {

		// console.log( globalUniforms.camera.viewMatrix.value.elm );
		// globalUniforms.camera.projectionMatrix.value.copy( cameraComponent.projectionMatrix );
		// globalUniforms.camera.viewMatrix.value.copy( cameraComponent.viewMatrix );

	} );

	// update frame

	eventsComponent.onUpdateBlidgeFrame.push( ( blidge, blidgeObject ) => {

		let cameraStateCurve = blidge.getCurveGroup( blidgeObject.animation.state )!.setFrame( blidge.frame.current );

		// fov
		let focalLength = cameraStateCurve.value.x;

		let f = perspectiveComponent.fov;
		let ff = 2 * Math.atan( 24 / ( 2 * focalLength ) ) / Math.PI * 180;

		if ( f !== ff ) {

			perspectiveComponent.fov = ff;
			cameraComponent.needsUpdate = true;

		}

		// track

		let track = cameraStateCurve.value.y > 0;
		lookAtComponent.enable = track;

	} );

	// resize

	eventsComponent.onResize.push( ( e ) => {

		rtDeferredShading.setSize( e.size );

		rtLightShaft1.setSize( e.size );
		rtLightShaft2.setSize( e.size );

		let lowRes = e.size.clone().multiply( 0.5 );


		rtSSR1.setSize( lowRes );
		rtSSR2.setSize( lowRes );

		props.rt.gBuffer.setSize( e.size );
		props.rt.output.setSize( e.size );

	} );

	return entity;

};
