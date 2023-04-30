#version 300 es
precision highp float;

in float offsetTime;

out float o_left;
out float o_right;

uniform float uDuration;
uniform float uSampleRate;

const float BPM = 145.0;

#define PI 3.1415

float saw(float x){

    return fract(-x*.5)*2.-1.;
	
}

float square( float time) {

	return sign( fract( time ) - 0.1 );
	
}

float tri(float x, float freq ){
	x *= freq;
    return abs(2.*fract(x*.5-.25)-1.)*2.-1.;
}

float whiteNoise(float time)
{
    return fract(sin(dot(vec2( time ), vec2(12.9898,78.233))) * 43758.5453);
}

// https://www.shadertoy.com/view/4dS3Wd
#define NUM_NOISE_OCTAVES 5

float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

float fbm(float x) {
	float v = 0.0;
	float a = 0.5;
	float shift = float(100);
	for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

float scaleToFreq( float scale ){

	return 6.2831 * 440.0 * pow( 1.06, scale );
	
}

float kick( float time, float phase, float fire[8] ) {

	float envTime = fract( phase );

	float t = envTime;
	t -= 0.05 * exp( -50.0 * envTime );
	t += 0.05;

	float o = (smoothstep( -0.8, 0.8, sin( t * 215.0 ) ) * 2.0 - 1.0)* exp( envTime * - 2.0 )* fire[ int( phase ) ];
	o *= 0.50;

    return o;

}

float powerKick( float phase, float fire[8] ) {

	float envTime = fract( phase );

	float t = envTime;
	t -= 0.03 * exp( -80.0 * envTime );
	t += 0.03;

	float o = ( smoothstep( -0.5, 0.5, sin( t * 900.0 ) ) * 2.0 - 1.0 ) * smoothstep( 1.0, 0.7, envTime ) * fire[ int( phase ) ];
	o *= 0.35;

    return o;

}

float hihat( float time ) {

  return noise(time * 8000.0)*max(0.0,1.0-min(0.85,time*4.25)-(time-0.25)*0.3) * 2.0;
  
}

float clap( float time, float fire[8] ) {

	float loopTime = fract(time);
	float t = 700.0 * loopTime;
	t -= fbm( loopTime * 2000.0 );

	float o = 0.0;
	o += fbm( loopTime * 1000.0 ) * ( 
		exp( (loopTime - 0.0) * - 7.0 ) * step( 0.0, loopTime ) +
		exp( (loopTime - 0.15) * - 7.0 ) * step( 0.015, loopTime ) +
		exp( (loopTime - 0.03) * - 7.0 ) * step( 0.03, loopTime )
	) * fire[ int( time ) ];
	
	o *= 0.4;
	return o;
	
}

float piko( float time, float phase, float fire[8] ) {
	
	float loopTime = fract(time);

	float w = pow( 1.06, fire[ int( floor( time ) ) ] );

	if( w == 1.0 ) return 0.0;

	float freq = 175.0 * w;
	float o = 0.0;

	o += tri( loopTime, freq );
	
	o *= 0.05;

    return o;

}

float wenwen( float time, float phase, float chord[3] ) {
	
	float fire[] = float[]( 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 );
	float loopTime = fract(phase);

	float o = 0.0;

	float scale = fire[int(phase)];
	float t = time * 0.05;
	o += square( t * scaleToFreq( chord[0] ) );
	o += square( t * scaleToFreq( chord[1] ) * 1.01 );
	o += square( t * scaleToFreq( chord[2] ) * 1.02 );
	o *= 0.4 + ( sin( loopTime * 10.5 ) * 0.5 + 0.5 ) * 0.6;
	o *= 0.03 * step( 0.05, fire[int(phase)] );

    return o;

}

float mainChord( float time, float phase, float cords[24] ) {

	float o = 0.0;

	time /= 4.0;

	for( int i = 0; i < 3; i++ ) {

		float freq = scaleToFreq( cords[int(phase * 3.0) + i] );

		o += ( sin( time * freq ) + sin( time * freq * 1.007 ) );

	}

	o *= 0.04;

	return o;

}

vec2 music( float time ) {

	vec2 o = vec2( 0.0 );
	
	float t = time * (BPM / 60.0);
	t = max( 0.0, t - 8.0 );

	if( t == 0.0 ) return vec2( 0.0 );

	float loop1 = fract( t );
	
	float loop4 = mod( t, 4.0 );
	float loop4Phase = floor( loop4 );

	float loop8 = mod( t, 8.0 );
	float loop8Phase = floor( loop8 );
	
	float loop16 = mod( t, 16.0 );
	float loop16Phase = floor( loop16 );
	
	float loop32 = mod( t, 32.0 );
	float loop32Phase = floor( loop32 );

	float phase32 = floor( t / 32.0 ); 
	float phase64 = floor( t / 64.0 ); 

	// tick
	
	// o += sin( time * 9000.0 ) * step( 0.9, 1.0 - loop1 ) * 0.05; 
	
	// chord
	
	const float cord[] = float[](
		-2.0, 6.0, 14.0,
		1.0, 8.0, 16.0,
		-6.0, 2.0, 11.0,
		-6.0, 2.0, 11.0,
		-2.0, 6.0, 14.0,
		-4.0, 4.0, 13.0,
		-6.0, 2.0, 11.0,
		-6.0, 2.0, 11.0
	);
	
	// chord

	if( phase32 >= 6.0 && phase32 <= 10.0) {

		o += mainChord( time, floor( loop32 / 4.0 ), cord );

	}

	// power kick

	if( phase32 < 2.0 || phase32 >= 4.0 && phase32 < 6.0 ) {

		o += powerKick( loop16 / 8.0, float[]( 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0 ) );

	}

	// kick

	if( phase32 >= 2.0 && phase32 < 4.0 || phase32 >= 6.0 ) {

		o += kick( time, loop16 / 2.0, float[]( 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0 ) );
		o += kick( time, loop16 / 2.0 - 0.5, float[]( 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ) );
		o += kick( time, loop16 / 2.0 - 0.25, float[]( 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) );
		
	}

	// hihat

	if( phase32 >= 2.0 ) {

		o += hihat( fract( loop1 * 4.0 ) ) * 0.04 * fbm( floor(loop8 * 4.0 ) * 100.433 );
		o += hihat( fract( loop1 * 4.0 - 0.5 ) ) * 0.04 * fbm( floor(loop8 * 4.0 ) * 100.433 ) * step(0.95, sin( floor( loop8 * 4.0 ) * 5.445 - 0.2 ) );
		
	}

	//  clap 
	
	if( phase32 >= 2.0 ) {

		o += clap( (loop16 / 2.0), float[]( 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0 ) ) * 0.2;
		
	}

	// tintontanton

	float melLoop = loop32;

	if( phase32 >= 2.0 ) {

		melLoop = loop16 * 2.0;
		
		int s = int(floor( loop32 / 4.0)) * 3;

	}

	if( phase32 < 4.0 || phase32 >= 8.0) {

		float melEnvTime = fract( melLoop );
		float melEnv = exp( melEnvTime * - 2.0 );
		float scale = float[]( 
			7.0, 10.0, 12.0, 14.0, 9.0, 10.0, 12.0, 14.0
		)[ int( mod(floor(melLoop) + floor( melLoop / 8.0 ) * 3.0, 8.0 ) ) ];

		o += ( sin( ( time - melEnv * 0.002 ) * scaleToFreq( scale ) ) ) * 0.15 * melEnv * vec2( 0.5 + sin( time * 2.0 ) * 0.3, 0.5 + cos( time * 2.0 ) * 0.3 );
		
	}

	// bebobebo

	
	if( phase32 >= 0.0 ) {

	}

	return o;
	
}

void main( void ) {

	float time = offsetTime / uSampleRate;

	vec2 o = music( time );

	o_left = o.x;
	o_right = o.y;

}