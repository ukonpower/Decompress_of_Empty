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

	outColor = vec4( 0.0, 0.0, 0.0, 1.0 );

	vec4 backBuffer = texture( uBackBuffer, vUv );
	vec4 velBuffer = texture( uVelBuffer, vUv );

	vec3 pos = backBuffer.xyz;
	vec3 vel = velBuffer.xyz;
	float lifeTime = velBuffer.w;

	float pixelX = 1.0 / uResolution.x;

	outColor = vec4( 0.0 );

	if ( vUv.x < pixelX ) {

		if( lifeTime == 0.0 ) {
		
			pos = vec3( 0.0, 0.0, 0.0 );

		} else {

			pos += vel;
			
		}

		outColor.xyz = pos;

	} else {

		// outColor = mix( backBuffer, texture( uBackBuffer, vUv - vec2( pixelX, 0.0 ) ), 0.95 ) * 0.995;
		outColor = texture( uBackBuffer, vUv - vec2( pixelX, 0.0 ) );

		outColor.xyz = mix( backBuffer.xyz, texture( uBackBuffer, vUv - vec2( pixelX * 1.5, 0.0 ) ).xyz, 0.2 );


	}

} 