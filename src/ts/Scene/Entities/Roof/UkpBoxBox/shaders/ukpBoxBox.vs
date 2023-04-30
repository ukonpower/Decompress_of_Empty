#include <common>
#include <vert_h>
#include <rotate>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;
layout ( location = 3 ) in vec3 id;

uniform float uTime;
uniform float uTimeSeq;
uniform float uBeat8;

out vec3 vId;

void main( void ) {

	#include <deferred_vert_in>

	outPos *= id.y;
	
	float b8 = uBeat8 - id.y * 0.3;
	float b = ( floor( b8 ) + ( 1.0 - exp( fract( b8 ) * -5.0 ) ) );

	mat2 rot;

	rot = rotate( b * 2.0 );
	outPos.xz *= rot;
	outNormal.xz *= rot;

	outPos.xy *= rot;
	outNormal.xy *= rot;

	rot = rotate( sin(uTimeSeq * 0.3 - id.y * 0.5) );
	outPos.xy *= rot;
	outNormal.xy *= rot;
	
	#include <deferred_vert_out>
	vId = id;
	
}