#version 300 es
precision highp float;

uniform vec3 uColor;

in vec2 vUv;
in vec3 vColor;
in vec2 vHighPrecisionZW;

layout (location = 0) out vec4 outColor0;
layout (location = 1) out vec4 outColor1;
layout (location = 2) out vec4 outColor2;

void main( void ) {

	#ifdef IS_DEPTH
	
		float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
		outColor0 = vec4( 1.0 );
		return;

	#endif

	outColor0 = vec4( vColor, 1.0 );
	outColor1 = vec4( 1.0, 0.0, 0.0, 1.0 );
	outColor2 = vec4( 0.0, 1.0, 0.0, 1.0 );

}