//[
vec4 mv = viewMatrix * vec4(outPos, 1.0);
#ifdef IS_DEPTH
	float depth_z = (-mv.z - cameraNear ) / ( cameraFar - cameraNear );
	outColor0 = vec4( floatToRGBA( depth_z ) );
	return;
#endif
outColor0 = vec4( outPos, 1.0 );
outColor1 = vec4( normalize( outNormal * ( gl_FrontFacing ? 1.0 : -1.0 ) ), 1.0 );
outColor2 = vec4( outColor, outRoughness);
outColor3 = vec4( outEmission, outMetalic );
vec4 mvp = projectionMatrix * mv;
gl_FragDepth = ( mvp.z / mvp.w ) * 0.5 + 0.5;
//]