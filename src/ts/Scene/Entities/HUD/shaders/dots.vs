#include <common>
#include <rotate>
#include <uni_resolution>

precision highp float;

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec2 id;

#include <uni_time>

out vec2 vUv;

void main( void ) {

	vec3 pos = position;

	pos.x /= uAspectRatio;
	

	pos.xy += (-0.5 + id.x) * vec2( 1.65, 1.45 );
	pos.y += ( id.y) * 0.055;

	gl_Position = vec4( pos.xy, -1.0, 1.0 );

	vUv = uv;
		
}