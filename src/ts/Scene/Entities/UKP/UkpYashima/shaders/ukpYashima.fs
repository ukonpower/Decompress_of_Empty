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

	vec3 pp = p * 0.5;

	vec2 d = vec2( sdSphere( pp, 0.03 ), 0.0 );

	float b4 = uBeat8;
	float b = ( floor( b4 ) + ( 1.0 - exp( fract( b4 ) * -5.0 ) ) );

	
	for( int i = 0; i < 8; i++ ) {

		pp.x = abs( pp.x );

		pp.xy *= rotate( b * PI  / 4.0);
		pp.xz *= rotate( b * 0.1);

	}

	pp.y = abs( pp.y );
	pp.y -= 0.03;
	// pp.xz *= rotate(  uTimeSeq  * 0.3 );


	d = add( d, vec2( sdPyramid( pp, 0.7 ), 1.0 ) );


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

	// outEmission += vec3( 1.0 ) * smoothstep( 1.0, 0.5, dot( normal, -rayDir ) );

	if( dist.y == 1.0 ) {
		
		vec3 n2 = N( rayPos, 0.01 );

		outEmission += length(n2 - normal) * 0.3;

		outRoughness = 0.3 + snoise4D( vec4( rayPos, uTime) );
		outMetalic = snoise4D( vec4( rayPos, uTime) );
		outColor = vec3( 0.1, 0.2, 0.2 );
		
	} else if( dist.y == 0.0 ) {

		outEmission =  vec3( 1.0, 0.7, 0.7 ) * smoothstep( 0.0, 1.0, dot( normal, -rayDir ) );
		
	} 
		
	outNormal = normalize(modelMatrix * vec4( normal, 0.0 )).xyz;

	if( !hit ) discard;

	outPos = ( modelMatrix * vec4( rayPos, 1.0 ) ).xyz;
	#include <deferred_out>

}