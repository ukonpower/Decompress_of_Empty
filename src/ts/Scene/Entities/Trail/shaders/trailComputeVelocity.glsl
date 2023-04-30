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

	float tOffset = id * 0.55;
	vec3 pos = texture(uPosBuffer, vUv ).xyz;
	vec3 np = pos * (0.063 + ( 1.0 - uState.y ) * 0.2 );

	vec3 noise = vec3(
		snoise4D( vec4( np, tOffset + t ) ),
		snoise4D( vec4( np + 1234.5, tOffset + t ) ),
		snoise4D( vec4( np + 2345.6, tOffset + t ) )
	) * 0.006;

	float dir = atan2( pos.z, pos.x );
	vec3 rotVel = vec3( 0.0 );
	rotVel.x += sin( dir ) * 0.0008;
	rotVel.z += -cos( dir ) * 0.0008;
	rotVel.zy *= rotate( 0.6 );

	vel += rotVel;

	vel += noise * ( uState.y + 0.1 );

	vel += -pos * 0.0002;
	vel *= 0.97;

	float range = 5.0 + uState.y * 30.0;
	float floorOffset = pos.y - 3.0;
	vel.y -= sign( floorOffset ) * smoothstep( range, range + 0.1, abs( floorOffset ) ) * 0.05;

	outColor.xyz = vel;
	outColor.w = lifeTime + 0.1;

} 