#include <common>
#include <packing>
#include <deferred_h>
#include <sdf>
#include <rotate>
#include <noise4D>

uniform vec3 uRenderCameraPosition;
uniform mat4 modelMatrixInverse;
uniform float uTime;
uniform float uTimeSeq;
uniform float uBeat8;

vec2 D( vec3 p ) {


	float t = uTime;

	vec2 d = vec2( sdSphere( p, 0.8 + sin( t * 0.2 ) * 0.1 ), 0.0 );

	for( float i = 0.0; i < 6.0; i ++ ) {

		vec3 offset = vec3( sin( t * 2.0 * sin( i ) ), sin( t * sin( i ) + i ), sin( -t * 0.8 + i * PI ) )  * ( i < 3.0 ? 0.6 : 1.4 + sin( uTime + i * 2.3 ) * 0.2 );
		vec3 cp = p + offset;

		if( i < 3.0 ) {

			d.x = smoothAdd( d.x, sdSphere( cp, 0.9 + sin( t * 0.2 + i ) * 0.2 ), 0.8 );

		} else {

			d.x = smoothAdd( d.x, sdSphere( cp, 0.4 + sin( i ) * 0.2 ), 0.3 ); 

		}

	}

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

	vec3 normal;
	
	for( int i = 0; i < 64; i++ ) { 

		dist = D( rayPos );		
		rayPos += dist.x * rayDir;

		if( dist.x < 0.01 ) {

			normal = N( rayPos, 0.0001 );

			hit = true;
			break;

		}
		
	}

	// outEmission += vec3( 1.0 ) * smoothstep( 1.0, 0.5, dot( normal, -rayDir ) );

	if( dist.y == 0.0 ) {

		vec3 mp = rayPos;
		mp.xz *= rotate( uTimeSeq * 0.3 );
		mp.yz *= rotate( uTimeSeq * 0.1 );

		outColor = vec3( fract( mp.z * 4.0 ) );
		outRoughness = 0.2;

 	} 
		
	outNormal = normalize(modelMatrix * vec4( normal, 0.0 )).xyz;

	if( !hit ) discard;

	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;
	#include <deferred_out>

}