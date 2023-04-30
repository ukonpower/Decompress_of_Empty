import { Geometry } from './Geometry';
import { Vector } from '../Math/Vector';

export class SphereGeometry extends Geometry {

	constructor( radius: number = 0.5, widthSegments: number = 20, heightSegments: number = 10 ) {

		super();

		const posArray = [];
		const normalArray = [];
		const uvArray = [];
		const indexArray = [];

		for ( let i = 0; i <= heightSegments; i ++ ) {

			const thetaI = i / heightSegments * Math.PI;

			const segments = ( i != 0 && i != heightSegments ) ? widthSegments : widthSegments;

			for ( let j = 0; j < segments; j ++ ) {

				// pos

				const thetaJ = j / segments * Math.PI * 2.0;
				const widthRadius = Math.sin( thetaI ) * radius;

				const x = Math.cos( thetaJ ) * widthRadius;
				const y = - Math.cos( thetaI ) * radius;
				const z = - Math.sin( thetaJ ) * widthRadius;

				posArray.push( x, y, z );

				// uv

				uvArray.push(
					j / segments,
					i / heightSegments
				);

				//normal

				const normal = new Vector( x, y, z ).normalize();

				normalArray.push( normal.x, normal.y, normal.z );

				// index

				indexArray.push(
					i * widthSegments + j,
					i * widthSegments + ( j + 1 ) % widthSegments,
					( i + 1 ) * widthSegments + ( j + 1 ) % widthSegments,

					i * widthSegments + j,
					( i + 1 ) * widthSegments + ( j + 1 ) % widthSegments,
					( i + 1 ) * widthSegments + j,

				);

			}

		}

		this.setAttribute( 'position', posArray, 3 );
		this.setAttribute( 'normal', normalArray, 3 );
		this.setAttribute( 'uv', uvArray, 2 );
		this.setAttribute( 'index', indexArray, 1 );

	}

	public setAttribute( name: ( 'position' | 'uv' | 'normal' | 'index' ) | ( string & {} ), array: number[], size: number ): void {

		if ( name == 'index' ) {

			array.forEach( ( item, index ) => {

				// クソ
				array[ index ] = item % this.count;

			} );

		}

		super.setAttribute( name, array, size );



	}

}
