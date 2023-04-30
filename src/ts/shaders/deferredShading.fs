#include <common>
#include <packing>
#include <light_h>
#include <re>

// uniforms

uniform sampler2D sampler0; // position, depth
uniform sampler2D sampler1; // normal 
uniform sampler2D sampler2; // albedo, roughness
uniform sampler2D sampler3; // emission, metalic

uniform vec3 uColor;
uniform vec3 uRenderCameraPosition;
uniform mat4 viewMatrix;

in vec2 vUv;

layout (location = 0) out vec4 glFragOut;

void main( void ) {

	// inputs
	
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
		normalize( uRenderCameraPosition - tex0.xyz ),
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

			shadow = getShadowSmooth( tex0.xyz, directionalLightCamera[ LOOP_INDEX ], directionalLightShadowMap[ LOOP_INDEX ] );
			
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

			shadow = getShadowSmooth( geo.position, spotLightCamera[ LOOP_INDEX ], spotLightShadowMap[ LOOP_INDEX ] );

			// lighting

			sLight = spotLight[ LOOP_INDEX ];

			spotDirection = normalize(sLight.position - geo.position);
			spotDistance = length( sLight.position - geo.position );
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
	gl_FragDepth = 0.5;

}