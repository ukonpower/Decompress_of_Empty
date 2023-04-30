#include <common>
#include <rotate>

precision highp float;

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in float id;

#include <uni_time>

out vec2 vUv;

void main( void ) {

	vec3 pos = position;
	pos.xy *= rotate( PI * id );
	pos.x += uv.y * 0.02;

	pos.xy += (-0.5 + id) * vec2( -0.95, 1.6 );

	gl_Position = vec4( pos.xy, -1.0, 1.0 );

	vUv = uv;
	vUv.x += uTime * 0.02;
		
}