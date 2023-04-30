#include <common>
#include <rotate>

layout ( location = 0 ) in vec3 position;
layout ( location = 1 ) in vec2 uv;
layout ( location = 2 ) in vec3 normal;
layout ( location = 3 ) in vec3 id;

#include <uni_time>
#include <uni_beat>
#include <uni_resolution>

uniform sampler2D uComBuf;
uniform vec2 uComputeSize;

out float vAlpha;

void main( void ) {

	vec3 pos = position;
	float pixelX = 1.0 / uComputeSize.x;
	vec4 computeBuffer = texture( uComBuf, vec2( pixelX * 1.5, id.x ) );

	float v = easeOut( smoothstep( 0.0, 1.0, computeBuffer.w ), 10.0);
	v = 1.0;

	float size = smoothstep( 1.0, 0.5, computeBuffer.z) * 2.0 + 0.015;
	size *= 0.2 + id.x * 2.0;

	gl_Position = vec4( computeBuffer.xyz, 1.0 );
	gl_Position.xy += pos.xy * vec2( 1.0, uAspectRatio ) * ( 0.5 + v * 0.5 ) * size;
	gl_Position.z = 0.0;

	vAlpha = sin( min(computeBuffer.w * 3.0, 1.0) * 5.0 * PI - ( PI / 2.0 )) * 0.5 + 0.5;
	vAlpha *= 0.1 + smoothstep( 0.5, 0.7, id.x ) * 0.5;
		
}