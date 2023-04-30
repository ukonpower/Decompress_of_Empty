#include <common>
#include <packing>
#include <deferred_h>

uniform float uTimeSeq;
uniform float uBeat8;

in vec3 vVel;

void main( void ) {

	#include <deferred_in>
	outEmission += smoothstep( 0.023, 0.065, length(vVel) );
	outRoughness = 0.03;
	outMetalic = 1.0;
	#include <deferred_out>

} 