#version 300 es
precision highp float;

#include <uni_time>
#include <random>

uniform sampler2D sampler0;
uniform float threshold;

uniform vec4 uPP;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

void main( void ) {

	vec4 c = texture( sampler0, vUv );
  
	vec3 f;
	f.x = max(0.0, c.x - threshold);
	f.y = max(0.0, c.y - threshold);
	f.z = max(0.0, c.z - threshold);

	outColor = vec4(vec3(c) * f, 1.0 );
	
	if( uPP.x > 0.01 ) {

		outColor += ( smoothstep( 0.9, 1.0, random( vec2( floor( vUv.y * 3.0) / 3.0 ) + uTime ) ) ) * 0.3 * uPP.x;
		
	}

}