#include <common>
#include <packing>
#include <deferred_h>
#include <sdf>
#include <rotate>

uniform vec3 uRenderCameraPosition;
uniform mat4 modelMatrixInverse;
uniform float uTime;
uniform float uTimeSeq;
uniform float uBeat4;
uniform float uBeat8;
uniform vec4 uState;

vec2 D( vec3 p ) {

	vec3 pp = p;
	p = p * 0.5;

	float invStateZ = ( 1.0 - uState.z);

	vec3 r = p;
	r.xy *= rotate( p.z + uTime * 0.1);
	r.xy = pmod( r.xy, 24.0);
	r.y -= 0.5;

	float wave = sin( r.z + uBeat8 * PI ) * ( 1.0 - uState.x );

	vec2 d = vec2( sdSphere( p, 0.75 + wave * 0.1   + uState.x * 0.2 ), 0.0 );

	d = sub( d, vec2( sdBox( r, vec3( 0.05 + wave * 0.02 + uState.x * 0.02,0.6, 1.0 ) ), 0.0 ) );
	
	d = add( d, vec2( sdSphere ( p, 0.18 ), 1.0 ) );

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

	if( !hit ) discard;

	if( dist.y == 0.0 ) {

		outEmission += length(N( rayPos, 0.02 ) - normal) * uState.x * 0.5;

	} else if( dist.y == 1.0 ) {

		float dnv = dot( normal, -rayDir );

 		outEmission += vec3( 1.0, 0.5, 0.5 ) * exp( fract(uBeat8 + dnv ) * -5.0 ) * ( 1.0 - uState.y );
		outEmission += 1.0 * uState.y * ( dnv * 0.8 + 0.2 );
		
	}

	outNormal = normalize(modelMatrix * vec4( normal, 0.0 )).xyz;
	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;
	#include <deferred_out>

}