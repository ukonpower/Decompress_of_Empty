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

	// pos.yz *= rotate( uTime * 0.3 );
	// pos.xz *= rotate( uTime * 0.5);

	// pos.x /= uAspectRatio;

	// pos.xy += id.x * 0.6 * vec2( 1.15, 1.0 );
	pos *= 1.75;

	gl_Position = vec4( pos.xy, -1.0, 1.0 );


	vUv = uv;
		
}