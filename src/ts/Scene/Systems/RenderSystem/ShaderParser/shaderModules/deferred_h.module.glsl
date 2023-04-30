uniform float cameraNear;
uniform float cameraFar;

in vec2 vUv;
in vec3 vColor;
in vec3 vNormal;
in vec3 vViewNormal;
in vec3 vPos;
in vec3 vMVPosition;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

layout (location = 0) out vec4 outColor0; // position, depth
layout (location = 1) out vec4 outColor1; // normal 
layout (location = 2) out vec4 outColor2; // albedo, roughness
layout (location = 3) out vec4 outColor3; // emission, metalic
