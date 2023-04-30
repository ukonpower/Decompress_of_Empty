#include <common>
#include <packing>
#include <deferred_h>

uniform vec4 uState;
in vec3 vId;

void main( void ) {

	#include <deferred_in>

	// outEmission += 1.0;

	float v = smoothstep( 0.0, 1.0, -vId.x + uState.x );

	if( v < 0.05 ) discard;

	outEmission += v;

	#include <deferred_out>

} 