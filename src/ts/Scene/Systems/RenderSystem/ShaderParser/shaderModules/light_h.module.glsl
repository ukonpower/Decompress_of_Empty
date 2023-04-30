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

// shadowmap

float compareShadowDepth( float lightDepth, sampler2D shadowMap, vec2 shadowCoord ) {

	float shadowMapDepth = rgbaToFloat( texture( shadowMap, shadowCoord ) );

	if( shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0 ) {

		return step( lightDepth, shadowMapDepth + 0.002 );

	}

	return 1.0;

}

// shadow

void setShadowCoord( vec3 pos, LightCamera camera, inout vec2 shadowCoord, inout float lightDepth ) {
	
	vec4 mvPosition = camera.viewMatrix * vec4( pos, 1.0 );
	vec4 mvpPosition = camera.projectionMatrix * mvPosition;
	shadowCoord = ( mvpPosition.xy / mvpPosition.w ) * 0.5 + 0.5;
	
	float lightNear = camera.near;
	float lightFar = camera.far;
	lightDepth = ( -mvPosition.z - lightNear ) / ( lightFar - lightNear );

}

float getShadow( vec3 pos, LightCamera camera, sampler2D shadowMap ) {

	vec2 shadowCoord;
	float lightDepth;

	setShadowCoord( pos, camera, shadowCoord, lightDepth );

	return compareShadowDepth( lightDepth, shadowMap, shadowCoord );

}

#define SHADOW_SAMPLE_COUNT 2

float getShadowSmooth( vec3 pos, LightCamera camera, sampler2D shadowMap ) {

	vec2 shadowCoord;
	float lightDepth;

	setShadowCoord( pos, camera, shadowCoord, lightDepth );
	float shadowSum = compareShadowDepth( lightDepth, shadowMap, shadowCoord );

	for( int i = 0; i < SHADOW_SAMPLE_COUNT; i++ ) {

		vec2 offset = 1.0 / camera.resolution * ( float( i + 1 ) / float( SHADOW_SAMPLE_COUNT ) ) * 1.0;

		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( -offset.x, -offset.y ) );
		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( 0.0, -offset.y ) );
		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( offset.x, -offset.y ) );
		
		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( -offset.x, 0.0 ) );
		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( offset.x, 0.0 ) );

		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( -offset.x, offset.y ) );
		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( 0.0, offset.y ) );
		shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord + vec2( offset.x, offset.y ) );

	}

	return shadowSum / ( 8.0 * float( SHADOW_SAMPLE_COUNT ) + 1.0 );

}
