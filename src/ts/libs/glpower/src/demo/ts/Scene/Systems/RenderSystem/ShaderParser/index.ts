import { Lights } from "..";

type Defines = {[key:string]: number | string} | undefined;

export const shaderInsertDefines = ( shader: string, defines: Defines ) => {

	if ( ! defines ) return shader;

	const splited = shader.split( '\n' );

	let insertIndex = splited.findIndex( item => item.indexOf( 'precision' ) > - 1 );

	if ( insertIndex == - 1 ) {

		insertIndex = splited.findIndex( item => item.indexOf( '#version' ) > - 1 );

	}

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

export const shaderInsertLights = ( shader: string, lights: Lights ) => {

	shader = shader.replaceAll( 'NUM_LIGHT_DIR', lights.directionalLight.length.toString() );
	shader = shader.replaceAll( 'NUM_LIGHT_SPOT', lights.spotLight.length.toString() );

	return shader;

};

export const shaderUnrollLoop = ( shader: string ) => {


	shader = shader.replace( /#pragma\sloop_start\s(\d+)*([\s\S]+?)#pragma\sloop_end/g, ( _: string, loop: string, body: string ) => {

		let str = "";

		for ( let i = 0; i < Number( loop ); i ++ ) {

			str += body.replaceAll( 'LOOP_INDEX', i.toString() );

		}

		return str;

	} );

	return shader;

};


export const shaderParse = ( shader: string, defines: Defines, lights: Lights ) => {

	shader = shaderInsertDefines( shader, defines );
	shader = shaderInsertLights( shader, lights );
	shader = shaderUnrollLoop( shader );

	return shader;

};
