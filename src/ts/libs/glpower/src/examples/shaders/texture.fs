#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUv;
out vec4 glFragOut;

void main( void ) {

	vec4 color = texture( uTexture, vUv ) + 0.1;
	glFragOut = color;

}