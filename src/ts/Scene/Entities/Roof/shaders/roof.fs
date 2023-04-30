#include <common>
#include <packing>
#include <deferred_h>
#include <sdf>
#include <rotate>
//[

uniform vec3 uRenderCameraPosition;
uniform mat4 modelMatrixInverse;
uniform float uTime;

vec2 D( vec3 p ) {

	vec2 d = vec2( 0.0 );

	d = vec2( sdBox( p, vec3( 40.0, 1.0, 40.0 ) ), 0.0 );

	// p.xz *= rotate( 0.5 + uTime );
	
	d = sub( d, vec2( sdBox( p, vec3( 2.5, 2.0, 2.5 ) ), 1.0 ) );
	
	return d;

}

vec3 N( vec3 pos, float delta ){

    return normalize( vec3(
		D( pos ).x - D( vec3( pos.x - delta, pos.y, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y - delta, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y, pos.z - delta ) ).x
	) );
	
}

void main( void ) {

	#include <deferred_in>

	vec3 rayPos = ( modelMatrixInverse * vec4( vPos, 1.0 ) ).xyz;
	vec3 rayDir = normalize( ( modelMatrixInverse * vec4( normalize( vPos - uRenderCameraPosition ), 0.0 ) ).xyz );
	vec2 dist = vec2( 0.0 ); 
	bool hit = false;

	for( int i = 0; i < 90; i++ ) { 

		dist = D( rayPos );		
		rayPos += dist.x * rayDir;

		if( dist.x < 0.01 ) {

			vec3 n = N( rayPos, 0.00001 );
			outNormal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;
 
			hit = true;
			break;

		}
		
	}

	if( !hit ) discard;
	
	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;
	#include <deferred_out>

}
//]