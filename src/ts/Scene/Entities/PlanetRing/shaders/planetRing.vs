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

uniform vec4 uState;

out vec3 vId;

void main( void ) {

	#include <deferred_vert_in>
	
	outPos *= 1.0 + id.y * 2.5;
	outPos.xz *= uState.x;
	outPos.yz *= rotate( 0.05 );
	outPos.xz *= rotate( uTimeSeq * 0.2 );
	
	float b8 = uBeat8 - id.y * 0.3;
	float b = ( floor( b8 ) + ( 1.0 - exp( fract( b8 ) * -5.0 ) ) );
	
	#include <deferred_vert_out>
	vId = id;
	
}