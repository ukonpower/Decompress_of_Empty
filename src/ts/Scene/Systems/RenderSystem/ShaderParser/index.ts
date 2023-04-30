import common from './shaderModules/common.module.glsl';
import sdf from './shaderModules/sdf.module.glsl';
import random from './shaderModules/random.module.glsl';
import rotate from './shaderModules/rotate.module.glsl';
import noise4D from './shaderModules/noise4D.module.glsl';
import packing from './shaderModules/packing.module.glsl';
import light_h from './shaderModules/light_h.module.glsl';
import deferred_h from './shaderModules/deferred_h.module.glsl';
import deferred_in from './shaderModules/deferred_in.module.glsl';
import deferred_out from './shaderModules/deferred_out.module.glsl';
import re from './shaderModules/re.module.glsl';
import uniformBeat from './shaderModules/uniforms_beat.glsl';
import uniformTime from './shaderModules/uniforms_time.glsl';
import uniformResolution from './shaderModules/uniforms_resolution.glsl';


import vert_h from './shaderModules/vert_h.module.glsl';
import deferred_vert_in from './shaderModules/deferred_vert_in.module.glsl';
import deferred_vert_out from './shaderModules/deferred_vert_out.module.glsl';

import { Lights } from "..";

type Defines = {[key:string]: number | string} | undefined;

export const shaderInsertDefines = ( shader: string, defines: Defines ) => {

	if ( ! defines ) return shader;

	const splited = shader.split( '\n' );

	let insertIndex = splited.findIndex( item => item.indexOf( 'precision' ) > - 1 );

	if ( insertIndex == - 1 ) {

		insertIndex = splited.findIndex( item => item.indexOf( '#version' ) > - 1 );

	}

	if ( insertIndex == - 1 ) insertIndex = 0;

	const keys = Object.keys( defines );

	for ( let i = 0; i < keys.length; i ++ ) {

		splited.splice( insertIndex + 1, 0, "#define " + keys[ i ] + ' ' + defines[ keys[ i ] ] );

	}

	let res = '';

	splited.forEach( item => {

		res += item + '\n';

	} );

	return res;

};

export const shaderInclude = ( shader: string ) => {

	let dict : {[key: string]: string} = {
		"common": common,
		"packing": packing,
		"sdf": sdf,
		"rotate": rotate,
		"random": random,
		"noise4D": noise4D,
		"deferred_h": deferred_h,
		"deferred_in": deferred_in,
		"deferred_out": deferred_out,
		"light_h": light_h,
		"re": re,
		"uni_beat": uniformBeat,
		"uni_time": uniformTime,
		"uni_resolution": uniformResolution,
		"vert_h": vert_h,
		"deferred_vert_in": deferred_vert_in,
		"deferred_vert_out": deferred_vert_out,
	};

	shader = shader.replace( /#include\s?\<([\S]*)\>/g, ( _: string, body: string ) => {

		let str = "";

		let module = dict[ body ] || '';

		module = module.replace( /#define GLSLIFY .*\n/g, "" );
		str += module;

		return str;

	} );

	return shader;

};

const shaderInsertLights = ( shader: string, lights: Lights ) => {

	shader = shader.replaceAll( 'NUM_LIGHT_DIR', lights.directionalLight.length.toString() );
	shader = shader.replaceAll( 'NUM_LIGHT_SPOT', lights.spotLight.length.toString() );

	return shader;

};

const shaderUnrollLoop = ( shader: string ) => {

	shader = shader.replace( /#pragma\sloop_start\s(\d+)*([\s\S]+?)#pragma\sloop_end/g, ( _: string, loop: string, body: string ) => {

		let str = "";

		for ( let i = 0; i < Number( loop ); i ++ ) {

			str += body.replaceAll( 'LOOP_INDEX', i.toString() );

		}

		return str;

	} );

	return shader;

};

export const shaderParse = ( shader: string, defines: Defines, lights?: Lights ) => {

	shader = shaderInclude( shader );

	if ( lights ) {

		shader = shaderInsertLights( shader, lights );

	}

	shader = shaderInsertDefines( shader, defines );
	shader = shaderUnrollLoop( shader );
	shader = shader.replace( /#define GLSLIFY .*\n/g, "" );

	return shader;

};
