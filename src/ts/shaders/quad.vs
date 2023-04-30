#include <common>
#include <vert_h>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;

void main( void ) {

	gl_Position = vec4( position.xy, 0.99, 1.0 );
	vUv = uv;

}