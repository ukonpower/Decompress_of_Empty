#include <common>
#include <packing>
#include <light_h>

in float vAlpha;

layout (location = 0) out vec4 outColor;

void main( void ) {

	outColor = vec4( vec3( 1.0, 1.0, 1.0 ), vAlpha);

} 