import { IVector4 } from "..";
import { Quaternion } from "./Quaternion";
import { IVector3, Vector } from "./Vector";

export class Matrix {

	public elm: number[];

	constructor( elm?: number [] ) {

		this.elm = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		];

		if ( elm ) {

			this.set( elm );

		}

	}

	public identity() {

		this.elm = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		];

		return this;

	}

	public clone() {

		return new Matrix().copy( this );

	}

	public copy( mat: Matrix ) {

		this.set( mat.elm );

		return this;

	}

	public perspective( fov: number, aspect: number, near: number, far: number ) {

		var r = 1 / Math.tan( fov * Math.PI / 360 );
		var d = far - near;

		this.elm = [
			r / aspect, 0, 0, 0,
			0, r, 0, 0,
			0, 0, - ( far + near ) / d, - 1,
			0, 0, - ( far * near * 2 ) / d, 0
		];

		return this;

	}

	public orthographic( width: number, height: number, near: number, far: number ) {

		this.elm = [
			2 / width, 0, 0, 0,
			0, 2 / height, 0, 0,
			0, 0, - 2 / ( far - near ), 0,
			0, 0, - ( far + near ) / ( far - near ), 1,
		];

		return this;

	}

	public lookAt( eye: Vector, target: Vector, up: Vector ) {

		const zAxis = eye.clone().sub( target ).normalize();
		const xAxis = up.clone().cross( zAxis ).normalize();
		const yAxis = zAxis.clone().cross( xAxis ).normalize();

		this.elm = [
		   xAxis.x, xAxis.y, xAxis.z, 0,
		   yAxis.x, yAxis.y, yAxis.z, 0,
		   zAxis.x, zAxis.y, zAxis.z, 0,
		   eye.x,
		   eye.y,
		   eye.z,
		   1,
		];

		return this;

	}

	public inverse() {

		const a = this.elm[ 0 ], b = this.elm[ 1 ], c = this.elm[ 2 ], d = this.elm[ 3 ],
			  e = this.elm[ 4 ], f = this.elm[ 5 ], g = this.elm[ 6 ], h = this.elm[ 7 ],
			  i = this.elm[ 8 ], j = this.elm[ 9 ], k = this.elm[ 10 ], l = this.elm[ 11 ],
			  m = this.elm[ 12 ], n = this.elm[ 13 ], o = this.elm[ 14 ], p = this.elm[ 15 ],
			q = a * f - b * e, r = a * g - c * e,
			s = a * h - d * e, t = b * g - c * f,
			u = b * h - d * f, v = c * h - d * g,
			w = i * n - j * m, x = i * o - k * m,
			y = i * p - l * m, z = j * o - k * n,
			A = j * p - l * n, B = k * p - l * o,
			det = ( q * B - r * A + s * z + t * y - u * x + v * w ),
			ivd = 1 / det;

		if ( det == 0 ) return this.identity();

		this.elm[ 0 ] = ( f * B - g * A + h * z ) * ivd;
		this.elm[ 1 ] = ( - b * B + c * A - d * z ) * ivd;
		this.elm[ 2 ] = ( n * v - o * u + p * t ) * ivd;
		this.elm[ 3 ] = ( - j * v + k * u - l * t ) * ivd;
		this.elm[ 4 ] = ( - e * B + g * y - h * x ) * ivd;
		this.elm[ 5 ] = ( a * B - c * y + d * x ) * ivd;
		this.elm[ 6 ] = ( - m * v + o * s - p * r ) * ivd;
		this.elm[ 7 ] = ( i * v - k * s + l * r ) * ivd;
		this.elm[ 8 ] = ( e * A - f * y + h * w ) * ivd;
		this.elm[ 9 ] = ( - a * A + b * y - d * w ) * ivd;
		this.elm[ 10 ] = ( m * u - n * s + p * q ) * ivd;
		this.elm[ 11 ] = ( - i * u + j * s - l * q ) * ivd;
		this.elm[ 12 ] = ( - e * z + f * x - g * w ) * ivd;
		this.elm[ 13 ] = ( a * z - b * x + c * w ) * ivd;
		this.elm[ 14 ] = ( - m * t + n * r - o * q ) * ivd;
		this.elm[ 15 ] = ( i * t - j * r + k * q ) * ivd;

		return this;

	}

	public transpose() {

		const e11 = this.elm[ 0 ], e12 = this.elm[ 1 ], e13 = this.elm[ 2 ], e14 = this.elm[ 3 ],
			e21 = this.elm[ 4 ], e22 = this.elm[ 5 ], e23 = this.elm[ 6 ], e24 = this.elm[ 7 ],
			e31 = this.elm[ 8 ], e32 = this.elm[ 9 ], e33 = this.elm[ 10 ], e34 = this.elm[ 11 ],
			e41 = this.elm[ 12 ], e42 = this.elm[ 13 ], e43 = this.elm[ 14 ], e44 = this.elm[ 15 ];

		this.elm[ 0 ] = e11; this.elm[ 1 ] = e21; this.elm[ 2 ] = e31; this.elm[ 3 ] = e41;
		this.elm[ 4 ] = e12; this.elm[ 5 ] = e22; this.elm[ 6 ] = e32; this.elm[ 7 ] = e42;
		this.elm[ 8 ] = e13; this.elm[ 9 ] = e23; this.elm[ 10 ] = e33; this.elm[ 11 ] = e43;
		this.elm[ 12 ] = e14; this.elm[ 13 ] = e24; this.elm[ 14 ] = e34; this.elm[ 15 ] = e44;

		return this;

	}

	public set( elm: number[] ) {

		for ( let i = 0; i < this.elm.length; i ++ ) {

			this.elm[ i ] = elm[ i ] ?? 0;

		}

		return this;

	}

	public setFromTransform( pos: IVector3, qua: Quaternion | IVector4, scale: IVector3 ) {

		this.identity();

		this.applyPosition( pos );

		this.applyQuaternion( qua );

		this.applyScale( scale );

		return this;

	}

	public applyPosition( position: IVector3 ) {

		this.matmul( [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			position.x, position.y, position.z, 1
		] );

		return this;

	}

	public applyQuaternion( q: Quaternion | IVector4 ) {

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const xx = x * x, yy = y * y, zz = z * z, ww = w * w;
		const xy = x * y, xz = x * z, xw = x * w, yz = y * z, yw = y * w, zw = z * w;

		this.matmul( [
			xx - yy - zz + ww,
			2 * ( xy + zw ),
			2 * ( xz - yw ),
			0,

			2 * ( xy - zw ),
			- xx + yy - zz + ww,
			2 * ( yz + xw ),
			0,

			2 * ( xz + yw ),
			2 * ( yz - xw ),
			- xx - yy + zz + ww,

			0, 0, 0, 0, 1
		] );

		return this;

	}

	public applyScale( scale: IVector3 ) {

		this.matmul( [
			scale.x, 0, 0, 0,
			0, scale.y, 0, 0,
			0, 0, scale.z, 0,
			0, 0, 0, 1
		] );

		return this;

	}

	protected matmul( elm2: number[] ) {

		const dist = new Array( 16 );

		for ( let i = 0; i < 4; i ++ ) {

			for ( let j = 0; j < 4; j ++ ) {

				let sum = 0;

				for ( let k = 0; k < 4; k ++ ) {

					sum += this.elm[ k * 4 + j ] * elm2[ k + i * 4 ];

				}

				dist[ j + i * 4 ] = sum;

			}

		}

		this.elm = dist;

	}

	public multiply( m: Matrix ) {

		this.matmul( m.elm );

		return this;

	}

	public preMultiply( m: Matrix ) {

		const tmp = this.copyToArray( [] );

		this.set( m.elm );

		this.matmul( tmp );

		return this;

	}

	public decompose( pos?: IVector3, rot?: Quaternion, scale?: IVector3 ) {

		if ( pos ) {

			pos.x = this.elm[ 12 ];
			pos.y = this.elm[ 13 ];
			pos.z = this.elm[ 14 ];

		}

		if ( rot ) {

			rot.setFromMatrix( this );

		}

		if ( scale ) {

			// todo

		}

	}

	public copyToArray( array: number[] ) {

		array.length = this.elm.length;

		for ( let i = 0; i < this.elm.length; i ++ ) {

			array[ i ] = this.elm[ i ];

		}

		return array;

	}

}
