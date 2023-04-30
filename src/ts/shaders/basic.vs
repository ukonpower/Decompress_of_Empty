#include <common>
#include <vert_h>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;

void main( void ) {

	#include <deferred_vert_in>
	#include <deferred_vert_out>
	
}