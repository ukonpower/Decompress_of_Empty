export const WireBoxGeometry = ( width: number, height: number, depth: number, t: number, ) => {

	const posArray = [];
	let normalArray = [];
	const uvArray = [];
	const indexArray = [];

	for ( let i = 0; i < 12; i ++ ) {

		let hx = t / 2;
		let hy = height / 2;
		let hz = t / 2;

		let offsetX = ( i % 2 ) - 0.5;
		let offsetY = 0.0;
		let offsetZ = Math.floor( i / 2 ) - 0.5;

		if ( i >= 4 ) {

			hx = width / 2;
			hy = t / 2;
			hz = t / 2;

			offsetX = 0;
			offsetY = ( i % 2 ) - 0.5;
			offsetZ = Math.floor( i % 4 / 2 ) - 0.5;

		}

		if ( i >= 8.0 ) {

			hx = t / 2;
			hy = t / 2;
			hz = depth / 2;

			offsetX = ( i % 2 ) - 0.5;
			offsetY = Math.floor( i % 8 / 2 ) - 0.5;
			offsetZ = 0.0;

		}

		posArray.push(
			...( [ - hx, hy, hz,
				hx, hy, hz,
				- hx, - hy, hz,
				hx, - hy, hz,

				hx, hy, - hz,
				- hx, hy, - hz,
				hx, - hy, - hz,
				- hx, - hy, - hz,

				hx, hy, hz,
				hx, hy, - hz,
				hx, - hy, hz,
				hx, - hy, - hz,

				- hx, hy, - hz,
				- hx, hy, hz,
				- hx, - hy, - hz,
				- hx, - hy, hz,

				- hx, hy, - hz,
				hx, hy, - hz,
				- hx, hy, hz,
				hx, hy, hz,

				- hx, - hy, hz,
				hx, - hy, hz,
				- hx, - hy, - hz,
				hx, - hy, - hz, ].map( ( item, k ) => {

				return item + [ offsetX * width, offsetY * height, offsetZ * depth ][ k % 3 ];

			} ) )
		);

		normalArray.push(
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, - 1,
			0, 0, - 1,
			0, 0, - 1,
			0, 0, - 1,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			- 1, 0, 0,
			- 1, 0, 0,
			- 1, 0, 0,
			- 1, 0, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, - 1, 0,
			0, - 1, 0,
			0, - 1, 0,
			0, - 1, 0,
		);

		for ( let j = 0; j < 6; j ++ ) {

			uvArray.push(
				0, 1,
				1, 1,
				0, 0,
				1, 0
			);

			const offset = 4 * j + i * 24;

			indexArray.push(
				0 + offset, 2 + offset, 1 + offset, 1 + offset, 2 + offset, 3 + offset
			);

		}

	}

	return {
		posArray,
		normalArray,
		uvArray,
		indexArray
	};

};
