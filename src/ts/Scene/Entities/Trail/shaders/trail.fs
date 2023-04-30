#include <common>
#include <packing>
#include <deferred_h>

in vec3 vId;

uniform float uTimeSeq;
uniform float uBeat8;
uniform vec4 uState;

void main( void ) {

	#include <deferred_in>

	outEmission += smoothstep( 0.8, 1.0, vId.y) * ( 1.0 - vUv.y ) * vec3( 1.0, 0.05, 0.0 );

	float v = smoothstep( 0.0, 1.0, -vId.y + uState.x * 2.0 );

	if( vUv.y > v ) {

		discard;
		
	}

	#include <deferred_out>

} 