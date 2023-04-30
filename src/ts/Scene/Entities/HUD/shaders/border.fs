#include <common>
#include <packing>

layout (location = 0) out vec4 outColor;

in vec2 vUv;

void main( void ) {

	float v = step( 0.5, fract( vUv.x * 20.0 ) );

	outColor = vec4( 1.0, 1.0, 1.0, v * 0.5 );

} 