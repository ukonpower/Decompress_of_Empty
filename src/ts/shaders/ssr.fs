#include <common>
#include <packing>
#include <light_h>
#include <random>

// uniforms

uniform sampler2D sampler0;
uniform sampler2D sampler1;
uniform sampler2D uSceneTex;
uniform sampler2D uSSRBackBuffer;

uniform float uTime;
uniform mat4 cameraMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform vec3 uRenderCameraPosition;

// varying

in vec2 vUv;

layout (location = 0) out vec4 outColor;

#define MARCH 24.0
#define LENGTH 20.0

void main( void ) {

	vec3 lightShaftSum = vec3( 0.0 );

	vec3 rayPos = texture( sampler0, vUv ).xyz;

	if( rayPos.x + rayPos.y + rayPos.z == 0.0 ) return;

	vec3 rayDir = reflect( normalize( ( cameraMatrix * projectionMatrixInverse * vec4( vUv * 2.0 - 1.0, 1.0, 1.0 ) ).xyz ), texture( sampler1, vUv ).xyz ) ;

	float rayStepLength = LENGTH / MARCH;
	vec3 rayStep = rayDir * rayStepLength;

	float totalRayLength = random(vUv + fract(uTime)) * rayStepLength;

	if( length( rayPos - uRenderCameraPosition ) > LENGTH + totalRayLength ) return;

	rayPos += rayDir * totalRayLength;

	vec3 col;

	for( int i = 0; i < int( MARCH ); i ++ ) {

		vec4 depthCoord = (projectionMatrix * viewMatrix * vec4(rayPos, 1.0 ) );
		depthCoord.xy /= depthCoord.w;

		if( abs( depthCoord.x ) > 1.0 || abs( depthCoord.y ) > 1.0 ) break;

		depthCoord.xy = depthCoord.xy * 0.5 + 0.5;
		
		vec4 samplerDepth = texture( sampler0, depthCoord.xy );

		if( samplerDepth.x + samplerDepth.y + samplerDepth.z == 0.0 ) {
			break;
		};

		vec4 rayViewPos = viewMatrix * vec4( rayPos, 1.0 );
		vec4 depthViewPos = viewMatrix * vec4( samplerDepth.xyz, 1.0 );

		if( rayViewPos.z < depthViewPos.z && rayViewPos.z >= depthViewPos.z - 1.0 ) {

			col = texture( uSceneTex, depthCoord.xy ).xyz;
			break;

		}
		
		rayPos += rayStep;
		totalRayLength += rayStepLength;

	}

	outColor = vec4( mix( texture( uSSRBackBuffer, vUv ).xyz, col, 0.2 ), 1.0 );

}