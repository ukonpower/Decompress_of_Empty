//[
vec4 modelPosition = modelMatrix * vec4( outPos, 1.0 );
vec4 mvPosition = viewMatrix * modelPosition;
gl_Position = projectionMatrix * mvPosition;
vUv = outUv;
vViewNormal = ( normalMatrix * vec4(outNormal, 0.0) ).xyz;
vNormal = ( modelMatrix * vec4(outNormal, 0.0) ).xyz;
vPos = modelPosition.xyz;
vMVPosition = mvPosition.xyz;
//]