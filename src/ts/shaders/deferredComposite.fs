#version 300 es
precision highp float;

uniform sampler2D sampler0;
uniform sampler2D uLightShaftTexture;
uniform sampler2D uSSRTexture;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

void main( void ) {

	vec3 col = texture( sampler0, vUv ).xyz;
	col += texture( uLightShaftTexture, vUv ).xyz;
	col += texture( uSSRTexture, vUv ).xyz * 0.15;

	outColor = vec4( col, 1.0 );

}