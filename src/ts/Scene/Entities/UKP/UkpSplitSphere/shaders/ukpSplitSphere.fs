#include <common>
#include <packing>
#include <deferred_h>
#include <sdf>
#include <rotate>

uniform vec3 uRenderCameraPosition;
uniform mat4 modelMatrixInverse;
uniform float uTime;
uniform float uTimeSeq;

vec2 slice( vec3 p ) {

	p.xy *= rotate( 0.5 );

	p.x += uTimeSeq * 0.1;

	p.x = mod( p.x, 0.5 ) - 0.25;

	float d = sdBox( p, vec3( 0.1, 10.0, 10.0 ) );

	return vec2( d, 0.0 );

}

vec2 D( vec3 p ) {

	vec2 d = vec2( 0.0 );

	d.x = sdSphere( p, 1.5 );
	d = sub( d, slice( p ) );
	d = add( d, vec2( sdSphere( p, 0.5 ), 1.0 ) );

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
	
	for( int i = 0; i < 128; i++ ) { 

		dist = D( rayPos );		
		rayPos += dist.x * rayDir;

		if( dist.x < 0.01 ) {

			normal = N( rayPos, 0.0001 );

			hit = true;
			break;

		}
		
	}

	if( dist.y == 1.0 ) {

		outEmission += vec3( 1.0 ) * smoothstep( 1.0, 0.5, dot( normal, -rayDir ) );
		
	}

	outNormal = normalize(modelMatrix * vec4( normal, 0.0 )).xyz;

	if( !hit ) discard;

	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;
	#include <deferred_out>

}