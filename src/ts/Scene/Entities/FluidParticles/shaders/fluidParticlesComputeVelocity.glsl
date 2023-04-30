#include <common>
#include <random>

layout (location = 0) out vec4 outColor;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uBackBuffer;
uniform sampler2D uPosBuffer;
uniform vec4 uState;
in vec2 vUv;

#include <noise4D>
#include <rotate>

void main( void ) {

	vec4 backBuffer = texture( uBackBuffer, vUv );

	float t = uTime * 0.8;
	float id = vUv.x + vUv.y * uResolution.x;

	float lifeTime = backBuffer.w;
	vec3 vel = backBuffer.xyz;

	if( lifeTime < 1.0 ) {

		float tOffset = id * 0.01;
		vec3 pos = texture(uPosBuffer, vUv ).xyz;
		vec3 np = pos * 0.15;

		vec3 noise = vec3(
			snoise4D( vec4( np, tOffset + t ) ),
			snoise4D( vec4( np + 1234.5, tOffset + t ) ),
			snoise4D( vec4( np + 2345.6, tOffset + t ) )
		);

		noise = noise * 0.0003;
		vel += noise;
		vel.y += 0.00001;

		float dir = atan2( pos.z, pos.x );
		vel.x += sin( dir ) * 0.0001;
		vel.z += -cos( dir ) * 0.0001;

		float floorOffset = pos.y;
		float range = 1.0 + uState.x * 30.0;
		vel.y -= sign( floorOffset ) * smoothstep( range, range + 1.0, abs( floorOffset) ) * 0.0005;

		lifeTime += 0.016 / 9.0;

	} else {

		vel = vec3( 0.0 );
		lifeTime = 0.0;

	}

	outColor.xyz = vel;
	outColor.w = lifeTime;

} 