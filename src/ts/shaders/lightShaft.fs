#include <common>
#include <packing>
#include <light_h>

// uniforms

uniform sampler2D sampler0;
uniform sampler2D uLightShaftBackBuffer;

uniform float uTime;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrixInverse;
uniform vec3 uRenderCameraPosition;

// varying

in vec2 vUv;

layout (location = 0) out vec4 outColor;

const float MARCH_LENGTH = 40.0;
const float MARCH = 32.0;

#include <random>

void main( void ) {

	vec3 lightShaftSum = vec3( 0.0 );

	vec3 rayPos = uRenderCameraPosition;
	vec3 rayDir = normalize( ( cameraMatrix * projectionMatrixInverse * vec4( vUv * 2.0 - 1.0, 1.0, 1.0 ) ).xyz );

	vec3 rayEndPos = texture( sampler0, vUv ).xyz;

	if( rayEndPos.x + rayEndPos.y + rayEndPos.z == 0.0 ) {
		
		rayEndPos = rayPos + rayDir * 100.0;

	}
	
	vec3 diff = rayEndPos - rayPos;
	float rayLength = length( diff );

	float rayStepLength = MARCH_LENGTH / MARCH;;
	vec3 rayStep = rayDir * rayStepLength;;

	float totalRayLength = random(vUv + fract(uTime)) * 1.0 * rayStepLength;
	rayPos += rayDir * totalRayLength;

	for( int i = 0; i < int( MARCH ); i ++ ) {

		rayPos += rayStep;
		totalRayLength += rayStepLength;

		if( totalRayLength >= rayLength ) break;

		#if NUM_LIGHT_DIR > 0 

			DirectionalLight dLight;

			#pragma loop_start NUM_LIGHT_DIR

				dLight = directionalLight[ LOOP_INDEX ];

				lightShaftSum += dLight.color * getShadowSmooth( rayPos, directionalLightCamera[ LOOP_INDEX ], directionalLightShadowMap[ LOOP_INDEX ] ) * rayStepLength * 0.02;

			#pragma loop_end
		
		#endif

		// spotlight

		#if NUM_LIGHT_SPOT > 0

			SpotLight sLight;
			
			vec3 spotDirection;
			float spotDistance;
			float spotAngleCos;
			float spotAttenuation;

			#pragma loop_start NUM_LIGHT_SPOT

				sLight = spotLight[ LOOP_INDEX ];

				spotDirection = normalize(sLight.position - rayPos);
				spotDistance = length( sLight.position - rayPos );
				spotAngleCos = dot( sLight.direction, spotDirection );
				spotAttenuation = 0.0;

				if( spotAngleCos > sLight.angle * -1.0 ) {

					spotAttenuation = smoothstep( sLight.angle, sLight.angle + ( 1.0 - sLight.angle ) * sLight.blend, spotAngleCos );

				}

				lightShaftSum += sLight.color * 
					getShadow( rayPos, spotLightCamera[ LOOP_INDEX ], spotLightShadowMap[ LOOP_INDEX ] ) * 
					spotAttenuation * pow( clamp( 1.0 - spotDistance / sLight.distance, 0.0, 1.0 ),  sLight.decay * 1.9 ) *
					rayStepLength * 0.04;

			#pragma loop_end
				
		#endif

	}

	outColor = vec4( mix( texture( uLightShaftBackBuffer, vUv ).xyz, lightShaftSum, 0.9 ), 1.0 );

}