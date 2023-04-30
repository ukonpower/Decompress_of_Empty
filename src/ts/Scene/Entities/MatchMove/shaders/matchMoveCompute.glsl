#include <common>

layout (location = 0) out vec4 outColor;

uniform vec2 uResolution;
uniform sampler2D uBackBuffer;
uniform sampler2D uPosGBuffer;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;

in vec2 vUv;

#include <random>

void main( void ) {

	outColor = vec4( 0.0, 0.0, 0.0, 1.0 );

	float pixelX = 1.0 / uResolution.x;

	if ( vUv.x < pixelX ) {

		vec4 markerWorldPos = texture( uBackBuffer, vUv );
		vec4 markerScreenPos = projectionMatrix * viewMatrix * vec4( markerWorldPos.xyz, 1.0 );
		markerScreenPos.xy /= markerScreenPos.w;

		vec4 gBufferWorldPos = texture( uPosGBuffer, markerScreenPos.xy * 0.5 + 0.5 );
		vec4 gBufferScreenPos = projectionMatrix * viewMatrix * vec4( gBufferWorldPos.xyz, 1.0 );
		gBufferScreenPos.xy /= gBufferScreenPos.w;

		vec4 beforeFrameMarkerPos = texture( uBackBuffer, vUv + vec2( 1.0 / uResolution.x * 1.5, 0.0 ) );

		if( // yabai 
			markerWorldPos.w == 0.0 && (
			markerScreenPos.z > gBufferScreenPos.z + 0.1 ||
			abs( markerScreenPos.z - gBufferScreenPos.z ) > 0.1 ||
			markerScreenPos.x < -1.0 ||
			markerScreenPos.x > 1.0 ||
			markerScreenPos.y < -1.0 ||
			markerScreenPos.y > 1.0 ||
			length( beforeFrameMarkerPos.xy - markerScreenPos.xy ) > 0.1 ) || 
			length( markerScreenPos.xy ) < 0.3
		) {

			outColor = texture( uPosGBuffer, vec2( random( vec2(uTime + 10.0 + vUv.y) ), random( vec2(uTime + vUv.y) )) );
			outColor.w = 1.0;

		} else{

			outColor = markerWorldPos;
			outColor.w = 0.0;
			
		}
		
	} else if( vUv.x < pixelX * 2.0 ){

		vec4 worldPos = texture( uBackBuffer, vec2( 0.0, vUv.y ) );
		vec4 beforeFramePos = texture( uBackBuffer, vUv );

		vec3 pos = worldPos.xyz;
		outColor = projectionMatrix * viewMatrix * vec4( pos, 1.0 );
		outColor.xyz /= outColor.w;

		if( worldPos.w > 0.5 ) {

			outColor.w = 0.2;

		} else {

			outColor.w = beforeFramePos.w + 0.01;

		}


	} else  {
		
		vec4 worldPos = texture( uBackBuffer, vec2( 0.0, vUv.y ) );
		
		if( worldPos.w > 0.5 ) {

			vec4 worldPos = texture( uBackBuffer, vec2( 0.0, vUv.y ) );
			outColor = projectionMatrix * viewMatrix * vec4( worldPos.xyz, 1.0 );
	 		outColor.xyz /= outColor.w;

		} else {

			outColor = texture( uBackBuffer, vUv - vec2( pixelX , 0.0 ) );

		}
		

	}

} 