#version 300 es
precision highp float;

uniform sampler2D sampler0;

uniform vec3 uColor;
uniform sampler2D uBloomTexture[4];
uniform sampler2D uLightShaftTexture;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

vec2 getMipmapUV( vec2 uv, float level ) {

	vec2 ruv = uv;

	float scale = 1.0 / pow( 2.0, level + 1.0 );

	ruv *= scale;
	ruv.y += scale;

	if( level > 0.0 ) {

		ruv.x += 1.0 - ( scale * 2.0 );

	}

	return ruv;

}

void main( void ) {

	vec4 col1 = texture( sampler0, vUv );

	vec3 col = col1.xyz;

	#pragma loop_start 4
	col += texture( uBloomTexture[ LOOP_INDEX ], vUv ).xyz * ( 0.3 + float(LOOP_INDEX) * 0.5 );
	#pragma loop_end

	col += texture( uLightShaftTexture, vUv ).xyz;

	outColor = vec4( col, 1.0 );

}