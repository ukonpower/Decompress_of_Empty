import { Uniforms } from "../GLPowerProgram";

export namespace UniformsUtils {

	export function merge( ...uniforms: ( Uniforms|undefined )[] ) : Uniforms {

		const res = {};

		for ( let i = 0; i < uniforms.length; i ++ ) {

			if ( uniforms[ i ] != undefined ) {

				Object.assign( res, uniforms[ i ] );

			}

		}

		return res;

	}

}
