#version 300 es
precision highp float;

#include <uni_time>
#include <random>

uniform sampler2D sampler0;
uniform sampler2D uBloomTexture[4];
uniform vec4 uPP;

in vec2 vUv;

layout (location = 0) out vec4 outColor;

vec2 lens_distortion(vec2 r, float alpha) {
    return r * (1.0 - alpha * dot(r, r));
}

// https://github.com/dmnsgn/glsl-tone-map/blob/main/filmic.glsl

vec3 filmic(vec3 x) {
  vec3 X = max(vec3(0.0), x - 0.004);
  vec3 result = (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);
  return pow(result, vec3(2.2));
}

void main( void ) {

	vec3 col = vec3( 0.0, 0.0, 0.0 );

	vec2 uv = vUv;

	if( uPP.x > 0.01 ) {

		uv.x += (random( floor( vUv * 3.3) / 3.3 + uTime ) - 0.5) * uPP.x * 0.2;
		uv.x += (random( floor( vUv * 10.0) / 10.0 + uTime ) - 0.5) * uPP.x * 0.2;
		uv.x += (random( floor( vUv * 40.0) / 40.0 + uTime ) - 0.5) * uPP.x * 0.2;
		uv.x += (random( vUv + uTime ) - 0.5) * uPP.x * 0.3;
		uv.x += ( smoothstep( 0.9, 1.0, random( vec2( floor( vUv.y * 20.0) / 20.0 ) + uTime ) ) ) * uPP.x * 0.2;
		
	}

	vec2 cuv = uv - 0.5;
	float len = length(cuv);
	float w = 0.035;

	float d;

	#pragma loop_start 8
		d = -float( LOOP_INDEX ) / 8.0 * w;
        col.x += texture( sampler0, (lens_distortion( cuv, d + uPP.x ) * 0.95 + 0.5) + vec2( (float( LOOP_INDEX ) / 8.0 - 0.5 ) * 0.003, 0.0 )).x;
        col.y += texture( sampler0, lens_distortion( cuv, d * 2.0 ) * 0.95 + 0.5 ).y;
        col.z += texture( sampler0, lens_distortion( cuv, d * 3.0 - uPP.x) * 0.95 + 0.5 ).z;
	#pragma loop_end
	col.xyz /= 8.0;

	#pragma loop_start 4
		col += texture( uBloomTexture[ LOOP_INDEX ], uv ).xyz * ( 0.3 + float(LOOP_INDEX) * 0.5 ) * 0.4;
	#pragma loop_end

	col *= 1.2;
	vec3 emi = max( vec3(0.0), col.xyz - 1.0 );
	col.xyz = filmic(col.xyz);
	col.xyz *= vec3( 0.92, 0.97, 1.0 );
	col.xyz += emi;

	col *= smoothstep( 0.9, 0.3, len );

	col.xyz *= uPP.y;

	outColor = vec4( col, 1.0 );

}