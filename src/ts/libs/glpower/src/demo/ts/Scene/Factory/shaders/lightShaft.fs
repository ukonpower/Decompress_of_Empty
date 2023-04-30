#version 300 es
precision highp float;

// light

struct DirectionalLight {
	vec3 direction;
	vec3 color;
};

struct SpotLight {
	vec3 position;
	vec3 direction;
	vec3 color;
	float angle;
	float blend;
	float distance;
	float decay;
};

struct LightCamera {
	float near;
	float far;
	mat4 viewMatrix;
	mat4 projectionMatrix;
	vec2 resolution;
};

struct Light {
	vec3 direction;
	vec3 color;
};

// uniforms

uniform sampler2D sampler0;
uniform vec3 uCameraPosition;

#if NUM_LIGHT_DIR > 0 

	uniform DirectionalLight directionalLight[NUM_LIGHT_DIR];
	uniform LightCamera directionalLightCamera[NUM_LIGHT_DIR];
	uniform sampler2D directionalLightShadowMap[NUM_LIGHT_DIR];
	
#endif

#if NUM_LIGHT_SPOT > 0 

	uniform SpotLight spotLight[NUM_LIGHT_SPOT];
	uniform LightCamera spotLightCamera[NUM_LIGHT_SPOT];
	uniform sampler2D spotLightShadowMap[NUM_LIGHT_SPOT];
	
#endif

// varying

in vec2 vUv;

layout (location = 0) out vec4 outColor;

vec4 floatToRGBA( float v ) {
	vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
	enc = fract(enc);
	enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
	return enc;
}

float rgbaToFloat( vec4 rgba ) {
	return dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) );
}

float compareShadowDepth( float lightDepth, sampler2D shadowMap, vec2 shadowCoord ) {

	float shadowMapDepth = rgbaToFloat( texture( shadowMap, shadowCoord ) );

	if( shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0 ) {

		return step( lightDepth, shadowMapDepth );

	}

	return 1.0;

}

float getShadow( vec3 pos, LightCamera camera, sampler2D shadowMap ) {

	vec4 mvPosition = camera.viewMatrix * vec4( pos, 1.0 );
	vec4 mvpPosition = camera.projectionMatrix * mvPosition;
	float lightNear = camera.near;
	float lightFar = camera.far;
	vec2 shadowCoord = ( mvpPosition.xy / mvpPosition.w ) * 0.5 + 0.5;

	float lightDepth = ( -mvPosition.z - lightNear ) / ( lightFar - lightNear );

	float shadowSum;

	shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord );

	return shadowSum;

}

uniform mat4 cameraMatrix;
uniform mat4 projectionMatrixInverse;

#define MARCH 16.0

#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 lightShaftSum = vec3( 0.0 );

	vec3 rayPos;
	vec3 rayEndPos;
	vec3 rayDir;
	float rayStepLength;
	vec3 rayStep;
	vec3 diff;

    #if NUM_LIGHT_SPOT > 0

		SpotLight sLight;
        
		vec3 spotDirection;
		float spotDistance;
		float spotAngleCos;
		float spotAttenuation;

		#pragma loop_start NUM_LIGHT_SPOT

			sLight = spotLight[ LOOP_INDEX ];

			rayPos = uCameraPosition;
            rayEndPos = texture( sampler0, vUv ).xyz;

			if( rayEndPos.x + rayEndPos.y + rayEndPos.z == 0.0 ) {
				
				rayDir = normalize( ( cameraMatrix * projectionMatrixInverse * vec4( vUv * 2.0 - 1.0, 1.0, 1.0 ) ).xyz );
				rayEndPos = rayPos + rayDir * 20.0;

			}

            diff = rayEndPos - rayPos;
            rayDir = normalize( diff );
			rayStepLength = length( diff ) / MARCH;
			rayStep = rayDir * rayStepLength;
			
			rayPos += random(vUv) * rayDir * rayStepLength;

            for( int i = 0; i < int( MARCH ); i ++ ) {

                rayPos += rayStep;

				spotDirection = normalize(sLight.position - rayPos);
				spotDistance = length( sLight.position - rayPos );
				spotAngleCos = dot( sLight.direction, spotDirection );
				spotAttenuation = 0.0;

				if( spotAngleCos > sLight.angle * -1.0 ) {

					spotAttenuation = smoothstep( sLight.angle, sLight.angle + ( 1.0 - sLight.angle ) * sLight.blend, spotAngleCos );

				}

    			lightShaftSum += sLight.color * getShadow( rayPos, spotLightCamera[ LOOP_INDEX ], spotLightShadowMap[ LOOP_INDEX ] ) * spotAttenuation * pow( clamp( 1.0 - spotDistance / sLight.distance, 0.0, 1.0 ),  sLight.decay ) * rayStepLength * 0.01;

            }

		#pragma loop_end
        
	#endif

	outColor = vec4( vec3( lightShaftSum ), 1.0 );

}