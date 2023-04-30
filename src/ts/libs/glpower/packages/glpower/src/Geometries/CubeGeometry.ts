import { Power } from '../Power';
import { Geometry } from './Geometry';

export class CubeGeometry extends Geometry {

	constructor( width: number = 1, height: number = 1, depth: number = 1, segmentsWidth: number = 1, segmentsHeight: number = 1, segmentsDepth: number = 1 ) {

		super();

		const posArray = [];
		const normalArray = [];
		const uvArray = [];
		const indexArray = [];
		const posYArray = [];

		const faces = [
			{ normal: [ 0, 0, 1 ], dir: [ 1, 0, 0 ], up: [ 0, 1, 0 ], w: width, h: height, d: depth, segW: segmentsWidth, segH: segmentsHeight },
			{ normal: [ 0, 0, - 1 ], dir: [ - 1, 0, 0 ], up: [ 0, 1, 0 ], w: width, h: height, d: depth, segW: segmentsWidth, segH: segmentsHeight },
			{ normal: [ 1, 0, 0 ], dir: [ 0, 0, - 1 ], up: [ 0, 1, 0 ], w: depth, h: height, d: width, segW: segmentsDepth, segH: segmentsHeight },
			{ normal: [ - 1, 0, 0 ], dir: [ 0, 0, 1 ], up: [ 0, 1, 0 ], w: depth, h: height, d: width, segW: segmentsDepth, segH: segmentsHeight },
			{ normal: [ 0, 1, 0 ], dir: [ - 1, 0, 0 ], up: [ 0, 0, 1 ], w: width, h: depth, d: height, segW: segmentsWidth, segH: segmentsDepth },
			{ normal: [ 0, - 1, 0 ], dir: [ - 1, 0, 0 ], up: [ 0, 0, - 1 ], w: width, h: depth, d: height, segW: segmentsWidth, segH: segmentsDepth },
		];

		let indexOffset = 0;

		for ( const face of faces ) {

			const n = face.normal;
			const dir = face.dir;
			const up = face.up;
			const segW = face.segW;
			const segH = face.segH;

			const hx = face.w / 2;
			const hy = face.h / 2;
			const hz = face.d / 2;

			const widthStep = face.w / segW;
			const heightStep = face.h / segH;

			for ( let i = 0; i <= segH; i ++ ) {

				for ( let j = 0; j <= segW; j ++ ) {

					const x = - hx + j * widthStep;
					const y = - hy + i * heightStep;
					const z = - hz;

					const u = j / segW;
					const v = i / segH;

					const px = x * - dir[ 0 ] + y * up[ 0 ] + z * - n[ 0 ];
					const py = x * - dir[ 1 ] + y * up[ 1 ] + z * - n[ 1 ];
					const pz = x * - dir[ 2 ] + y * up[ 2 ] + z * - n[ 2 ];

					posArray.push( px, py, pz );
					normalArray.push( ...n );
					uvArray.push( u, v );

					posYArray.push(
						i / segH * up[ 1 ] + ( Math.max( 0.0, up[ 2 ] ) ),
					);

					if ( i < segH && j < segW ) {

						const a = indexOffset + i * ( segW + 1 ) + j;
						const b = indexOffset + ( i + 1 ) * ( segW + 1 ) + j;
						const c = indexOffset + ( i + 1 ) * ( segW + 1 ) + ( j + 1 );
						const d = indexOffset + i * ( segW + 1 ) + ( j + 1 );

						indexArray.push( a, b, d );
						indexArray.push( b, c, d );

					}

				}

			}

			indexOffset += ( segW + 1 ) * ( segH + 1 );

		}

		this.setAttribute( 'position', posArray, 3 );
		this.setAttribute( 'normal', normalArray, 3 );
		this.setAttribute( 'uv', uvArray, 2 );
		this.setAttribute( 'posY', posYArray, 1 );
		this.setAttribute( 'index', indexArray, 1 );

	}

	public getComponent( power: Power ) {

		const component = super.getComponent( power );

		component.attributes.push( {
			name: 'posY',
			...this.getAttributeBuffer( power, "posY", Float32Array )
		} );

		return component;

	}

}
