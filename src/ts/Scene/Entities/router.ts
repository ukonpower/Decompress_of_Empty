import * as GLP from 'glpower';
import { world } from '~/ts/Globals';
import { ComponentBLidge } from '../Component';
import { getBaseMaterial, ComponentMaterial } from '../Component/Material';
import { materialFloor } from './Floor';
import { rings } from './Rings';
import { materialukpEye } from './UKP/UkpEye';
import { materialUkpSphere } from './UKP/UkpSphere';
import { materialUkpSplitSpere } from './UKP/UkpSplitSphere';
import { materialUkpYashima } from './UKP/UkpYashima';
import { matchMove } from './MatchMove';
import { planetRing } from './PlanetRing';
import { ukpBoxBox } from './Roof/UkpBoxBox';
import { hud } from './HUD';
import { materialUkpBubble } from './UKP/UkpBubble';
import { fluidParticles } from './FluidParticles';
import { grid } from './Grid';
import { trail } from './Trail';
import { materialUKPCore } from './UKP/UkpCore';
import { text } from './Text';
import { materialDeco } from './Deco';
import { greeting } from './Greeting';
import { pillars } from './Pillars';

export const entityRouter = ( entity: GLP.Entity, blidgeObject: GLP.BLidgeObject ) => {

	if ( blidgeObject.name == 'Rings' ) {

		rings( entity );

	} else if ( blidgeObject.name == 'UKP_BoxBox' ) {

		ukpBoxBox( entity );

	} else if ( blidgeObject.name == 'PlanetRing' ) {

		planetRing( entity );

	} else if ( blidgeObject.name == 'MatchMove' ) {

		matchMove( entity );

	} else if ( blidgeObject.name == 'HUD' ) {

		hud( entity );

	} else if ( blidgeObject.name == 'FluidParticles' ) {

		fluidParticles( entity );

	} else if ( blidgeObject.name == 'Grid' ) {

		grid( entity );

	} else if ( blidgeObject.name == 'Pillars' ) {

		pillars( entity );

	} else if ( blidgeObject.name == 'Trail' ) {

		trail( entity );

	} else if ( blidgeObject.name.indexOf( 'Text' ) > - 1 ) {

		text( entity, blidgeObject.name.split( '_' )[ 1 ] );

	} else if ( blidgeObject.name == 'Greeting' ) {

		greeting( entity );

	}

};

export const materialRouter = ( entity: GLP.Entity, blidgeObject: GLP.BLidgeObject ) => {

	if ( blidgeObject.material.name !== undefined && GLP.ECS.getComponent( world, entity, 'material' ) && GLP.ECS.getComponent( world, entity, 'geometry' ) ) return;

	let materialName = blidgeObject.material.name;

	const blidgeObjectComponent = GLP.ECS.getComponent<ComponentBLidge>( world, entity, 'blidge' )!;
	const { material, materialDepth } = getBaseMaterial( { name: materialName || blidgeObject.name, uniforms: blidgeObjectComponent.uniforms } );

	if ( materialName == 'Floor' ) {

		materialFloor( entity, material, materialDepth );

	} else if ( materialName == 'ukpSphere' ) {

		materialUkpSphere( entity, material, materialDepth );

	} else if ( materialName == 'ukpSplitSphere' ) {

		materialUkpSplitSpere( entity, material, materialDepth );

	} else if ( materialName == 'ukpYashima' ) {

		materialUkpYashima( entity, material, materialDepth );

	} else if ( materialName == 'ukpEye' ) {

		materialukpEye( entity, material, materialDepth );

	} else if ( materialName == 'ukpBubble' ) {

		materialUkpBubble( entity, material, materialDepth );

	} else if ( materialName == 'ukpCore' ) {

		materialUKPCore( entity, material, materialDepth );

	} else if ( materialName.indexOf( 'deco' ) > - 1 ) {

		materialDeco( entity, material, materialDepth );

	}

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'material', material );

	GLP.ECS.addComponent<ComponentMaterial>( world, entity, 'materialDepth', materialDepth );

};
