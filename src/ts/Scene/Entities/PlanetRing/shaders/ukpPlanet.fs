#include <common>
#include <packing>
#include <deferred_h>

void main( void ) {

	#include <deferred_in>

	outEmission += vec3( 1.0 ) * (1.0 - dot( vViewNormal, -normalize(vMVPosition) ));

	#include <deferred_out>

} 