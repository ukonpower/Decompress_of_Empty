#include <common>
#include <rotate>
#include <noise4D>

precision highp float;

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;
layout ( location = 3 ) in vec3 id;
layout ( location = 4 ) in float posY;

uniform float uTime;
uniform float uTimeSeq;
uniform float uBeat4;
uniform float uBeat8;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec4 uState;

out vec2 vUv;
out vec3 vColor;
out vec3 vViewNormal;
out vec3 vNormal;
out vec3 vMVPosition;
out vec3 vPos;
out float vPosY;

void main( void ) {

	vec3 pos = position;
	vec3 norm = normal;

	mat2 rot;

	float b4 = uBeat8 - id.y * 0.05;
	float b = ( floor( b4 ) + ( 1.0 - exp( fract( b4 ) * -5.0 ) ) );

	// pos.xz *= smoothstep( 2.5, 0.0, abs(pos.y)) * 0.5;
	// pos.xz *= smoothstep( -2.5, 2.5, pos.y) * 0.5;
	pos.xz *= 0.1;
	// pos.y *= 3.0;
	pos.y *= 0.07 + ( (id.z + 1.0) * 0.5 ) * 0.1;
	pos.y *= (0.05 + sin( id.x * PI * 6.0 + id.z + uTimeSeq) * 0.5 + 0.5) * uState.x;

	
	rot = rotate( b * 1.9 * id.z);
	// pos.zx *= rot;
	// norm.zx *= rot;
	
 	rot = rotate( PI / 2.0 );
	pos.zy *= rot;
	norm.zy *= rot;

	rot = rotate( uTimeSeq * 0.0 + (id.z ) * 0.1);
	// pos.xz *= rot;
	// norm.xz *= rot;

	pos.x += 6.0 + id.z * 2.0;
	pos.y += -3.0 + id.z * 3.0; 

	float rad = id.x * TPI;
	rad += uTimeSeq * 0.1;
	rot = rotate( rad  );
	pos.xz *= rot;
	norm.xz *= rot;

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vColor = vec3( uv, 1.0 );
	vViewNormal = ( normalMatrix * vec4(norm, 0.0) ).xyz;
	vNormal = ( modelMatrix * vec4( norm, 0.0 ) ).xyz;
	vPos = modelPosition.xyz;
	vMVPosition = mvPosition.xyz;
	vPosY = posY;

	
}