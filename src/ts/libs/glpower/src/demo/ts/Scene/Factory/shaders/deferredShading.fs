#version 300 es
precision highp float;

// types

struct Geometry {
	vec3 position;
	vec3 normal;
	float depth;
	vec3 viewDir;
	vec3 viewDirWorld;
};

struct Material {
	vec3 albedo;
	float roughness;
	float metalic;
	vec3 emission;
	vec3 diffuseColor;
	vec3 specularColor;
};

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

uniform sampler2D sampler0; // position, depth
uniform sampler2D sampler1; // normal 
uniform sampler2D sampler2; // albedo, roughness
uniform sampler2D sampler3; // emission, metalic

uniform vec3 uColor;
uniform vec3 uCameraPosition;
uniform mat4 viewMatrix;

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

in vec2 vUv;

layout (location = 0) out vec4 glFragOut;

// requires

#pragma glslify: import('./constants.glsl' )

vec4 floatToRGBA( float v ) {
	vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
	enc = fract(enc);
	enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
	return enc;
}

float rgbaToFloat( vec4 rgba ) {
	return dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) );
}

// re

float ggx( float dNH, float roughness ) {
	
	float a2 = roughness * roughness;
	a2 = a2 * a2;
	float dNH2 = dNH * dNH;

	if( dNH2 <= 0.0 ) return 0.0;

	return a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );

}

vec3 lambert( vec3 diffuseColor ) {

	return diffuseColor / PI;

}

float gSchlick( float d, float k ) {

	if( d == 0.0 ) return 0.0;

	return d / ( d * ( 1.0 - k ) + k );
	
}

float gSmith( float dNV, float dNL, float roughness ) {

	float k = clamp( roughness * sqrt( 2.0 / PI ), 0.0, 1.0 );

	return gSchlick( dNV, k ) * gSchlick( dNL, k );
	
}

float fresnel( float d ) {
	
	float f0 = 0.04;

	return f0 + ( 1.0 - f0 ) * pow( 1.0 - d, 5.0 );

}

vec3 RE( Geometry geo, Material mat, Light light) {

	vec3 lightDir = normalize( light.direction );
	vec3 halfVec = normalize( geo.viewDir + lightDir );

	float dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );
	float dNH = clamp( dot( geo.normal, halfVec ), 0.0, 1.0 );
	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	float dNL = clamp( dot( geo.normal, lightDir), 0.0, 1.0 );

	vec3 irradiance = light.color * dNL;

	// diffuse
	vec3 diffuse = lambert( mat.diffuseColor ) * irradiance;

	// specular
	float D = ggx( dNH, mat.roughness );
	float G = gSmith( dNV, dNL, mat.roughness );
	float F = fresnel( dLH );
	
	vec3 specular = (( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor ) * irradiance; 

	vec3 c = vec3( 0.0 );
	c += diffuse * ( 1.0 - F ) + specular;

	return c;

}

// shadowmap

float compareShadowDepth( float lightDepth, sampler2D shadowMap, vec2 shadowCoord ) {

	float shadowMapDepth = rgbaToFloat( texture( shadowMap, shadowCoord ) );

	if( shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0 ) {

		return step( lightDepth, shadowMapDepth + 0.010 );

	}

	return 1.0;

}

#define SHADOW_SAMPLE_COUNT 2

float getShadow( vec3 pos, LightCamera camera, sampler2D shadowMap ) {

	vec4 mvPosition = camera.viewMatrix * vec4( pos, 1.0 );
	vec4 mvpPosition = camera.projectionMatrix * mvPosition;
	float lightNear = camera.near;
	float lightFar = camera.far;
	vec2 shadowCoord = ( mvpPosition.xy / mvpPosition.w ) * 0.5 + 0.5;

	float lightDepth = ( -mvPosition.z - lightNear ) / ( lightFar - lightNear );

	float shadowSum;

	shadowSum += compareShadowDepth( lightDepth, shadowMap, shadowCoord );

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

void main( void ) {

	// iputs
	
	vec4 tex0 = texture( sampler0, vUv );
	vec4 tex1 = texture( sampler1, vUv );
	vec4 tex2 = texture( sampler2, vUv );
	vec4 tex3 = texture( sampler3, vUv );

	// output

	vec3 outColor = vec3( 0.0 );

	// structs

	Geometry geo = Geometry(
		tex0.xyz,
		tex1.xyz,
		0.0,
		normalize( uCameraPosition - tex0.xyz ),
		vec3( 0.0 )
	);
	
	Material mat = Material(
		tex2.xyz,
		tex2.w,
		tex3.w,
		tex3.xyz,
		mix( tex2.xyz, vec3( 0.0, 0.0, 0.0 ), tex3.w ),
		mix( vec3( 1.0, 1.0, 1.0 ), tex2.xyz, tex3.w )
	);

	float shadow;

	// direcitonalLight
	
	Light light;
	LightCamera lightCamera;

	#if NUM_LIGHT_DIR > 0 

		DirectionalLight dLight;

		#pragma loop_start NUM_LIGHT_DIR

			// shadow

			shadow = getShadow( tex0.xyz, directionalLightCamera[ LOOP_INDEX ], directionalLightShadowMap[ LOOP_INDEX ] );
			
			// lighting

			dLight = directionalLight[ LOOP_INDEX ];
			light.direction = dLight.direction;
			light.color = dLight.color;

			outColor += RE( geo, mat, light ) * shadow;

		#pragma loop_end
	
	#endif

	#if NUM_LIGHT_SPOT > 0

		SpotLight sLight;
		
		vec3 spotDirection;
		float spotDistance;
		float spotAngleCos;
		float spotAttenuation;

		#pragma loop_start NUM_LIGHT_SPOT

			// shadow

			shadow = getShadow( tex0.xyz, spotLightCamera[ LOOP_INDEX ], spotLightShadowMap[ LOOP_INDEX ] );

			// lighting

			sLight = spotLight[ LOOP_INDEX ];

			spotDirection = normalize(sLight.position - tex0.xyz);
			spotDistance = length( sLight.position - tex0.xyz );
			spotAngleCos = dot( sLight.direction, spotDirection );
			spotAttenuation = 0.0;

			if( spotAngleCos > sLight.angle ) {

				spotAttenuation = smoothstep( sLight.angle, sLight.angle + ( 1.0 - sLight.angle ) * sLight.blend, spotAngleCos );

			}

			light.direction = spotDirection;
			light.color = sLight.color * spotAttenuation * pow( clamp( 1.0 - spotDistance / sLight.distance, 0.0, 1.0 ),  sLight.decay );

			outColor += RE( geo, mat, light ) * shadow;

		#pragma loop_end
	
	#endif
	
	outColor += mat.emission;

	glFragOut = vec4( outColor, 1.0 );

}