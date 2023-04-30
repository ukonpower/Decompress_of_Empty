#version 300 es
precision highp float;

uniform vec3 uColor;

#ifdef IS_DEPTH

	vec4 floatToRGBA( float v ) {
		vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
		enc = fract(enc);
		enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
		return enc;
	}

	float rgbaToFloat( vec4 rgba ) {
		return dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) );
	}

	uniform float cameraNear;
	uniform float cameraFar;

#endif

in vec2 vUv;
in vec3 vColor;
in vec3 vNormal;
in vec3 vPos;
in vec3 vMVPosition;

layout (location = 0) out vec4 outColor0; // position, depth
layout (location = 1) out vec4 outColor1; // normal 
layout (location = 2) out vec4 outColor2; // albedo, roughness
layout (location = 3) out vec4 outColor3; // emission, metalic

void main( void ) {
	
	#ifdef IS_DEPTH
	
		float z = (-vMVPosition.z - cameraNear ) / ( cameraFar - cameraNear );
		outColor0 = vec4( floatToRGBA( z ) );

		return;
		
	#endif

	float depth = 0.0;
	float roughness = 0.2;
	float metalic = 0.0;

	vec3 color = vColor;

	outColor0 = vec4( vPos, 1.0 );
	outColor1 = vec4( normalize( vNormal * ( gl_FrontFacing ? 1.0 : -1.0 ) ), 1.0 );
	outColor2 = vec4( color, roughness );
	outColor3 = vec4( vec3( 1.0 ), metalic );

}