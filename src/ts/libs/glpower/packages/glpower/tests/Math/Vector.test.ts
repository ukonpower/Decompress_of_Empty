
/* eslint no-undef: 0 */

import { Vector } from '../../src/Math/Vector';
import { Matrix } from '../../src/Math/Matrix';

describe( 'Vector', () => {

	let vector: Vector;

	beforeEach( () => {

		vector = new Vector( 1, 2, 3, 4 );

	} );

	it( 'init', () => {

		expect( vector.x ).toBe( 1 );
		expect( vector.y ).toBe( 2 );
		expect( vector.z ).toBe( 3 );
		expect( vector.w ).toBe( 4 );

	} );

	it( 'multipleScalar', () => {

		vector.multiply( 2 );

		expect( vector.x ).toBe( 2 );
		expect( vector.y ).toBe( 4 );
		expect( vector.z ).toBe( 6 );
		expect( vector.w ).toBe( 8 );

	} );

	it( 'multipleVector', () => {

		vector.multiply( new Vector( 1, 2, 3, 4 ) );

		expect( vector.x ).toBe( 1 );
		expect( vector.y ).toBe( 4 );
		expect( vector.z ).toBe( 9 );
		expect( vector.w ).toBe( 16 );

	} );

	it( 'applyMatrix3', () => {

		vector.applyMatrix3( new Matrix( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] ) );

		expect( vector.x ).toBe( 38 );
		expect( vector.y ).toBe( 44 );
		expect( vector.z ).toBe( 50 );
		expect( vector.w ).toBe( 0 );

	} );

	it( 'applyMatrix4', () => {

		vector.applyMatrix4( new Matrix( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] ) );

		expect( vector.x ).toBe( 90 );
		expect( vector.y ).toBe( 100 );
		expect( vector.z ).toBe( 110 );
		expect( vector.w ).toBe( 120 );

	} );

} );
