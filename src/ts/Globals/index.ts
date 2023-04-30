import * as GLP from 'glpower';

import { SceneGraph } from '../Scene/SceneGraph';

export const canvas = document.createElement( "canvas" );

export const gl = canvas.getContext( 'webgl2' )!;

export const power = new GLP.Power( gl );

export const blidge = new GLP.BLidge();

export const world = GLP.ECS.createWorld();

export const sceneGraph = new SceneGraph();

export const BPM = 145.0;

export const gBuffer = new GLP.GLPowerFrameBuffer( gl );

gBuffer.setTexture( [
	power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ),
	power.createTexture().setting( { type: gl.FLOAT, internalFormat: gl.RGBA32F, format: gl.RGBA } ),
	power.createTexture(),
	power.createTexture(),
] );

export const globalUniforms: {[key: string]: GLP.Uniforms} = {
	time: {
		uTime: {
			value: 0,
			type: "1f"
		},
		uTimeSeq: {
			value: 0,
			type: "1f"
		}
	},
	beat: {
		uBeat: {
			value: 0,
			type: "1f"
		},
		uBeat2: {
			value: 0,
			type: "1f"
		},
		uBeat4: {
			value: 0,
			type: "1f"
		},
		uBeat8: {
			value: 0,
			type: "1f"
		},
		uBeat4Exp: {
			value: 0,
			type: "1f"
		},
		uBeat8Exp: {
			value: 0,
			type: "1f"
		},
	},
	resolution: {
		uResolution: {
			value: new GLP.Vector(),
			type: '2fv'
		},
		uAspectRatio: {
			value: 1.0,
			type: '1f'
		}
	},
	camera: {
		projectionMatrix: {
			value: new GLP.Matrix(),
			type: 'Matrix4fv'
		},
		viewMatrix: {
			value: new GLP.Matrix(),
			type: 'Matrix4fv'
		}
	}
};

/*-------------------------------
	DEBUG
-------------------------------*/

import { GPUState } from '../GPUState';
export let gpuState: GPUState | undefined = undefined;

// import 'webgl-memory';
// gpuState = new GPUState();
