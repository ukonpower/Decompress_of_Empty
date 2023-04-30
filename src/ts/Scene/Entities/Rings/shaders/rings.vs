#include <common>
#include <vert_h>

#include <rotate>
#include <noise4D>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;
layout ( location = 3 ) in vec3 id;

uniform float uTime;
uniform float uTimeSeq;
uniform float uBeat4;
uniform vec4 uState;

void main( void ) {

	#include <deferred_vert_in>
	
	mat2 rot;

	float b4 = uBeat4 - id.y * 0.0;
	float b = ( floor( b4 ) + ( 1.0 - exp( fract( b4 ) * -5.0 ) ) );

	float v = smoothstep( 0.0, 1.0, -id.y + uState.x * 2.0 ); 
	v = easeOut( v, 3.0 );

	outPos *= v;
	outPos.y *= ( 1.0 + sin( id.y * TPI + uTime ) * 0.8 ) * ( id.z * 0.5 + 0.05 );

	rot = rotate( id.y * TPI + uTime * 0.5 + v * 3.0 );
	outPos.xy *= rot;
	outNormal.xy *= rot;

	outPos.x += 5.0 * ( id.z * 0.3 + 0.5 );
	outPos.y += sin( id.y * TPI + uTime * 0.2 + id.z ) * sin( id.y * TPI + uTime * 0.2 ) * 0.5 ;
	outPos.y += id.z * 0.3;

	float rad = id.y * TPI;
	rad += uTimeSeq * 0.1;
	rot = rotate( rad );
	outPos.xz *= rot;
	outNormal.xz  *= rot;

	#include <deferred_vert_out>
	
}