#version 300 es

precision highp float;

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

out vec2 vUv;
out vec3 vColor;
out vec3 vNormal;
out vec3 vMVPosition;
out vec3 vPos;

void main( void ) {

	vec3 pos = position;

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vColor = vec3( uv, 1.0 );
	vNormal = ( modelMatrix * vec4(normal, 0.0) ).xyz;
	vPos = modelPosition.xyz;
	vMVPosition = mvPosition.xyz;
	
}