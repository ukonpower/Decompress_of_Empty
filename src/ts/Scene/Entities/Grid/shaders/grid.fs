#include <common>

layout (location = 0) out vec4 outColor;

in float vAlpha;

void main( void ) {

	outColor = vec4( vec3( 1.0 ), vAlpha * 0.3 );

} 