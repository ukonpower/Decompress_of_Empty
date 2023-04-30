#include <common>
#include <vert_h>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in float size;

uniform float uTime;
uniform vec3 uRange;
out float vAlpha;

void main( void ) {

	vec3 pos = position;
	pos.y += uRange.y / 2.0;
	pos.y = mod( pos.y + sin( uTime  * 0.5 + pos.x + pos.z ) * 0.1, uRange.y );
	pos.y -= uRange.y / 2.0;

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	vAlpha = smoothstep( -20.0, 1.0, mvPosition.z);
	gl_PointSize = 1.0 + size * 8.0 * vAlpha;
	
}