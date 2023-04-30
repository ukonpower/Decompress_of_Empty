import { Geometry } from './Geometry';
import { Vector } from '../Math/Vector';

export class TorusGeometry extends Geometry {

	constructor( majorRadius: number = 1, minorRadius: number = 0.4, radialSegments: number = 30, tubularSegments: number = 20 ) {

		super();

		const posArray = [];
		const normalArray = [];
		const uvArray = [];
		const indexArray = [];

		for ( let i = 0; i <= radialSegments; i ++ ) {

			const thetaI = i / radialSegments * Math.PI * 2;

			for ( let j = 0; j <= tubularSegments; j ++ ) {

				const thetaJ = j / tubularSegments * Math.PI * 2;

				// pos

				const x = ( majorRadius + minorRadius * Math.cos( thetaJ ) ) * Math.cos( thetaI );
				const y = minorRadius * Math.sin( thetaJ );
				const z = ( majorRadius + minorRadius * Math.cos( thetaJ ) ) * Math.sin( thetaI );

				posArray.push( x, y, z );

				// uv

				uvArray.push(
					i / radialSegments,
					j / tubularSegments
				);

				// normal

				const normal = new Vector(
					Math.cos( thetaI ) * Math.cos( thetaJ ),
					Math.sin( thetaI ) * Math.cos( thetaJ ),
					Math.sin( thetaJ )
				);

				normalArray.push( normal.x, normal.y, normal.z );

				// index

				if ( i < radialSegments && j < tubularSegments ) {

					const a = i * ( tubularSegments + 1 ) + j;
					const b = i * ( tubularSegments + 1 ) + j + 1;
					const c = ( i + 1 ) * ( tubularSegments + 1 ) + j + 1;
					const d = ( i + 1 ) * ( tubularSegments + 1 ) + j;

					indexArray.push( a, b, c, a, c, d );

				}

			}

		}

		this.setAttribute( 'position', posArray, 3 );
		this.setAttribute( 'normal', normalArray, 3 );
		this.setAttribute( 'uv', uvArray, 2 );
		this.setAttribute( 'index', indexArray, 1 );

	}

}
