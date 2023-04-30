#include <common>
#include <packing>
#include <deferred_h>
#include <sdf>
#include <rotate>
#include <noise4D>

uniform vec3 uRenderCameraPosition;
uniform mat4 modelMatrixInverse;
uniform float uTime;
uniform float uBeat4;
uniform float uBeat8;
uniform vec4 uState;

// ref: https://www.shadertoy.com/view/stdXWH

vec3 traverseGrid2D( vec2 ro, vec2 rd ) {
    const float GRID_INTERVAL = 1.0;

    vec2 grid = floor( ( ro + rd * 1E-2 * GRID_INTERVAL ) / GRID_INTERVAL ) * GRID_INTERVAL + 0.5 * GRID_INTERVAL;
    
    vec2 src = ( ro - grid ) / rd;
    vec2 dst = abs( 0.5 * GRID_INTERVAL / rd );
    vec2 bv = -src + dst;
    float b = min( bv.x, bv.y );
    
    return vec3( grid, b );
}

float D( vec3 p ) {

	float d = 0.0;

	vec3 s = vec3( 0.505, 4.0, 0.501 );

	d = sdBox( p, s );
	
	return d;

}

vec3 N( vec3 pos, float delta ){

    return normalize( vec3(
		D( pos ) - D( vec3( pos.x - delta, pos.y, pos.z ) ),
		D( pos ) - D( vec3( pos.x, pos.y - delta, pos.z ) ),
		D( pos ) - D( vec3( pos.x, pos.y, pos.z - delta ) )
	) );
	
}

void main( void ) {

	#include <deferred_in>

	vec3 ro = ( modelMatrixInverse * vec4( vPos, 1.0 ) ).xyz;
	vec3 rp = ro;
	float rl = 0.0;
	vec3 rd = normalize( ( modelMatrixInverse * vec4( normalize( vPos - uRenderCameraPosition ), 0.0 ) ).xyz );
	vec2 rdXZ = normalize( rd.xz );
	float dist = 0.0; 
	bool hit = false;

	vec3 gc = vec3( 0.0 );
	float lenNextGrid = 0.0;

	float b4 = uBeat4;
	float be = exp( fract( b4 ) * -5.0 );
	float b = floor( b4 ) + ( 1.0 - be );

	for( int i = 0; i < 64; i++ ) { 

		if( lenNextGrid <= rl ) {

			rl = lenNextGrid;
			rp = ro + rl * rd;
			vec3 grid = traverseGrid2D( rp.xz, rdXZ );
			gc.xz = grid.xy;

			float lg = length(gc.xz);
			
			gc.y = ( sin( lg + uTime ) * 0.5 - 0.5 ) * 0.5 * smoothstep( 15.0, 0.0, lg ) * uState.y;
			lenNextGrid += grid.z;

		}

		dist = D( rp - gc );
		rl += dist;
		rp = ro + rl * rd;

		if( dist < 0.01 ) {
			hit = true;
			break;
		}
		
	}

	if( hit ) {
		vec3 n = N( rp - gc, 0.00001 );
		outNormal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;
	}

	if( !hit ) discard;

	outPos = ( modelMatrix * vec4( rp, 1.0 ) ).xyz;
	// float len = length( outPos );
	// outEmission += step( 0.99, sin( len * 2.0 - uBeat8 * TPI - 0.5 ) ) * smoothstep( 15.0, 2.0, len ) * 1.0;
	#include <deferred_out>

}