#include <common>
#include <vert_h>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;
layout ( location = 3 ) in vec4 id;

#include <rotate>

uniform float uTime;
uniform vec3 uNum;
uniform vec4 uState;

out float vAlpha;

void main( void ) {

	vec3 pos = position;
	pos *= floor(1.0 - mod( id.x, uNum.z ) / uNum.z ) * 1.0 + 0.5;

	vec3 oPos = vec3( 0.0 );
	vec2 xz = ( id.xz / uNum.xz - 0.5 );

	oPos.xz += xz * 25.0;
	oPos.y += id.y * (4.0 + uState.x * 7.0);
	pos += oPos;
	pos.xz *= rotate( id.w * PI / 2.0 );

	vAlpha = smoothstep( 0.8, 0.0, abs( xz.x ) ) * smoothstep( 0.8, 0.0, abs( xz.y ) );

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( pos, 1.0 );

}