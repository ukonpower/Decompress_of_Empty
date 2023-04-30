#include <common>
#include <packing>
#include <deferred_h>

uniform sampler2D uTex;
uniform vec4 uChar;
in vec2 baseUV;

#ifdef IS_GREETING

	uniform float uAnimTime;

#endif

float median( float r, float g, float b ) {
	
    return max( min( r, g ), min( max( r, g ), b ) );
	
}
  

void main( void ) {

	#include <deferred_in>

	vec4 fontTex = texture( uTex, vUv );
    float sigDist = median( fontTex.r, fontTex.g, fontTex.b ) - 0.45;

    float alpha = step( 0.0, sigDist );

	#ifdef IS_GREETING

		if( sin( min(uAnimTime * 25.0, 1.0) * 3.0 * PI - ( PI / 2.0 )) * 0.5 + 0.5 < 0.5 ) discard; 
	
	#endif

	if( alpha < 0.5 ) discard;

	#if defined( IS_EMISSION )

		outEmission += 0.8;
	
	#endif

	#ifdef IS_BLK

		outColor = vec3( 0.0 );
	
	#endif

	#ifdef IS_BORDER

		outEmission += 1.0 - step( 0.05, sigDist);
		outColor = vec3( 0.0 );
	
	#endif

	#ifdef IS_IMAGINATION

		// outEmission += 1.0 - step( 0.05, sigDist);
		// outEmission += step( 0.0, sin(( baseUV.x + baseUV.y )* 10.0 ) );
		outEmission += vec3( 1.0, 0.0, 0.0 );
		outColor = vec3( 0.0 );
	
	#endif
	
	// vec3 col = vec3( smoothstep( -1.0, 1.5, 1.0 - (vUv.x - left) / uChar.z ) );
	vec3 col = vec3( smoothstep( 2.5, -0.8, ( (1.0 - vUv.y) - uChar.y) / uChar.w ) );

	// outEmission += 1.0;

	#include <deferred_out>

	#ifdef IS_FRONT
	
		gl_FragDepth = 0.01;
	
	#endif

	#ifdef IS_IMAGINATION

		gl_FragDepth = 0.001;

	#endif

} 