#include <common>
#include <packing>
#include <deferred_h>

in vec3 vId;

void main( void ) {

	#include <deferred_in>

	outEmission += smoothstep( 0.2, 0.1, vId.y );
	outEmission += smoothstep( 0.9, 0.9, vId.y );
	
	#include <deferred_out>

} 