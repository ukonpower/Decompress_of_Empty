#include <common>
#include <random>

layout (location = 0) out vec4 outColor;

uniform float uTimeSeq;
uniform vec2 uResolution;
uniform sampler2D uBackBuffer;
uniform sampler2D uVelBuffer;
in vec2 vUv;

#include <rotate>

void main( void ) {

	vec4 backBuffer = texture( uBackBuffer, vUv );
	vec4 velBuffer = texture( uVelBuffer, vUv );

	vec3 pos = backBuffer.xyz;
	vec3 vel = velBuffer.xyz;
	float lifeTime = velBuffer.w;

	if( lifeTime == 0.0) {
	
		pos = vec3( 12.0, 0.0, 0.0 );
		pos.xz *= rotate( vUv.x * TPI * 20.0 - uTimeSeq * 0.02 );

	} else {

		pos += vel;
		
	}

	outColor.xyz = pos;

} 