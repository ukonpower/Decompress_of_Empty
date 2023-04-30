#version 300 es

precision highp float;

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;

void main( void ) {

	gl_Position = vec4( position.xy, 0.99, 1.0 );

	vUv = uv;

}