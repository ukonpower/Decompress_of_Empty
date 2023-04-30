#include <common>
#include <rotate>

precision highp float;

layout ( location = 0 ) in vec2 uv;
layout ( location = 1 ) in float id;

uniform sampler2D uComBuf;

out vec2 vUv;
out vec3 vColor;
out vec3 vNormal;
out vec3 vMVPosition;
out vec3 vPos;
out float vAlpha;

void main( void ) {

	vec3 pos = vec3( 0.0, 0.0, 0.0 );

	vec3 offsetPos = texture( uComBuf, vec2( uv.x, id ) ).xyz;

	gl_Position = vec4( offsetPos.xyz, 1.0 );
	gl_Position.z = 0.0;
	vAlpha = (0.1 + smoothstep( 0.5, 0.7, id ) * 0.5) * 0.5;
	vUv = uv;

}