import { Vector } from '..';
import { Geometry } from './Geometry';

export class MipMapGeometry extends Geometry {

	constructor( count: number = 7 ) {

		super();

		this.count = count;

		const posArray = [];
		const uvArray = [];
		const indexArray = [];

		const p = new Vector( 0, 0 );
		let s = 1.0;

		for ( let i = 0; i < count; i ++ ) {

			posArray.push( - 1.0 + p.x,		1.0 + p.y,		0 );
			posArray.push( - 1.0 + p.x + s, 1.0 + p.y,		0 );
			posArray.push( - 1.0 + p.x + s, 1.0 + p.y - s,	0 );
			posArray.push( - 1.0 + p.x,		1.0 + p.y - s, 	0 );

			uvArray.push( 0.0, 1.0 );
			uvArray.push( 1.0, 1.0 );
			uvArray.push( 1.0, 0.0 );
			uvArray.push( 0.0, 0.0 );

			const indexOffset = ( i + 0.0 ) * 4;
			indexArray.push( indexOffset + 0, indexOffset + 2, indexOffset + 1, indexOffset + 0, indexOffset + 3, indexOffset + 2 );

			p.x += s;
			p.y = p.y - s;

			s *= 0.5;

		}

		this.setAttribute( 'position', posArray, 3 );
		this.setAttribute( 'uv', uvArray, 2 );
		this.setAttribute( 'index', indexArray, 1 );

	}


}
