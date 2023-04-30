#include <common>
#include <vert_h>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;
layout ( location = 3 ) in vec3 id;

out vec3 vVel;

uniform sampler2D uComPosBuf;
uniform sampler2D uComVelBuf;

#include <rotate>

void main( void ) {

	#include <deferred_vert_in>

	vec4 comPosBuffer = texture( uComPosBuf, id.xy );
	vec4 comVelBuffer = texture( uComVelBuf, id.xy );
	vec3 offsetPosition = comPosBuffer.xyz;
	float lifeTime = comVelBuffer.w;
	
	float uid = id.x + id.y * 128.0;

	vec3 vel = comVelBuffer.xyz;

	mat2 rot;
	rot = rotate( comPosBuffer.x * 0.5 + comVelBuffer.x);
	outPos.xz *= rot;
	outNormal.xz *= rot;

	rot = rotate( comPosBuffer.y * 0.5 + uid + comVelBuffer.y * 100.0);
	outPos.yz *= rot;
	outNormal.yz *= rot;

	outPos *= smoothstep( 1.0, 0.9, lifeTime);
	outPos *= smoothstep( 0.1, 0.15, lifeTime);
	outPos *= ( 0.01 + id.z * id.z ) * 0.4;
	outPos += offsetPosition;

	#include <deferred_vert_out>
	vVel = vel;
	
}