#version 300 es

precision highp float;

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform float time;
uniform vec4 uState;

out vec2 vUv;
out vec3 vColor;
out vec3 vNormal;
out vec3 vPos;
out vec3 vMVPosition;

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 pos = position;

	pos *= uState.x;
	pos.x += ( random( pos.xy + time ) - 0.5 ) * uState.y * 3.0;

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vColor = vec3( uv, 1.0 );
	vNormal = ( normalMatrix * vec4(normal, 1.0) ).xyz;
	vPos = modelPosition.xyz;
	vMVPosition = mvPosition.xyz;
	
}