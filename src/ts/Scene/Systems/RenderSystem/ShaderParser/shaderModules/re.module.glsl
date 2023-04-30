

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