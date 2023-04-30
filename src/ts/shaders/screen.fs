#include <common>
#include <packing>
#include <deferred_h>
#include <sdf>
#include <rotate>

uniform vec3 uColor;
uniform vec3 uRenderCameraPosition;
uniform mat4 modelMatrix;
uniform mat4 modelMatrixInverse;
uniform mat4 viewMatrix;
uniform float uTime;

#include <noise4D>

float D( vec3 p ) {

	float d = 0.0;

	float n1 = snoise4D( vec4( p * 2.0, uTime * 0.05 ) );
	float n2 = snoise4D( vec4( p + n1 * 0.5, uTime * 0.1 ) );
	d = sdBox( p, vec3( 0.5, 0.5, (n2 * 0.5 + 0.5 ) * 0.5 * 0.1 + 0.25 ) );

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

	vec3 rayPos = ( modelMatrixInverse * vec4( vPos, 1.0 ) ).xyz;
	vec3 rayDir = normalize( ( modelMatrixInverse * vec4( normalize( vPos - uRenderCameraPosition ), 0.0 ) ).xyz );
	float dist = 0.0; 
	bool hit = false;
	vec3 normal = vec3( 0.0 );

	for( int i = 0; i < 64; i++ ) { 

		dist = D( rayPos );		
		rayPos += dist * rayDir;

		if( dist < 0.01 ) {

			vec3 n = N( rayPos, 0.0001 );
			outNormal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;
 
			hit = true;
			break;

		}
		
	}

	if( !hit ) discard;
	
	vec3 color = vec3( 1.0 );

	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;
	#include <deferred_out>

}