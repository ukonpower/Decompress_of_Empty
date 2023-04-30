#include <common>
#include <vert_h>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;

uniform vec4 uChar;
out vec2 baseUV;

void main( void ) {

	#include <deferred_vert_in>

	baseUV = uv;

	outUv.y = 1.0 - outUv.y;
	outUv.y *= uChar.w;
	outUv.y = 1.0 - outUv.y;

	// outUv.x += 1.0 - (infoVisibility * smoothstep( 0.5, 1.0, loaded2));

	outUv.x *= uChar.z;
	outUv.x += uChar.x;
	outUv.y -= uChar.y;

	#include <deferred_vert_out>

	#ifdef IS_FRONT
	
		gl_Position.z = 0.01;
	
	#endif

} 