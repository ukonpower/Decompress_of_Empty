#include <common>
#include <packing>

layout (location = 0) out vec4 outColor;

in vec2 vUv;

void main( void ) {

	outColor = vec4( 1.0, 1.0, 1.0, smoothstep( 0.5, 0.45, length( vUv - 0.5 ) ) * 0.8 );

} 