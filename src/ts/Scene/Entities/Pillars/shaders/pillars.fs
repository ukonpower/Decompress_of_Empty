#include <common>
#include <packing>
#include <deferred_h>

in float vPosY;

void main( void ) {

	#include <deferred_in>


	float dnv = dot( normal, -rayDir );

	// outEmission += smoothstep( 0.5, 1.0, dot( vViewNormal, normalize( -vMVPosition ) ) );
	// outEmission += dot( vViewNormal, normalize( -vMVPosition ) );

	outMetalic = 0.2;
	outRoughness = 0.3;
	// outEmission += 1.0 * smoothstep(1.0, 0.0, vPosY);
	outEmission += 2.0;

	// outEmission += smoothstep( 0.0, 0.0, length( vUv.y - 0.5 ) ) * 0.2;

	// outRoughness = 0.1;

	#include <deferred_out>

	// gl_FragDepth = 0.01;


} 