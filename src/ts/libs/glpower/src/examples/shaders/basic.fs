#version 300 es
precision highp float;

in vec2 vUv;
in vec3 vColor;

out vec4 glFragOut;

void main( void ) {

	glFragOut = vec4( vColor, 1.0 );

}
