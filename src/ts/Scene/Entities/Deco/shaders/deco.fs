#include <common>
#include <packing>
#include <deferred_h>

uniform float uTimeSeq;
uniform float uBeat8;

void main( void ) {

	#include <deferred_in>
	
	outEmission += 1.0;

	#ifdef IS_SESSIONS

		outEmission *= 0.0;

		float border = sin(( vUv.x - vUv.y * 0.3 ) * 25.0 - uTimeSeq * 2.0 );
		if( border < 0.0 ) discard;
		outColor *= 0.0;

		outEmission += step( 0.0, border ) * 0.8;
	
	#endif

	#include <deferred_out>

	#ifdef IS_FRONT
	
		gl_FragDepth = 0.01;
	
	#endif

} 