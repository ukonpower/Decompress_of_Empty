import { IVector3, IVector4, Matrix, Types } from "..";
import { Vector } from "./Vector";

export type Quat = {
	x: number,
	y: number,
	z: number
}

export type EulerOrder = 'XYZ' | 'XZY' | 'ZYX' | 'YZX'

export class Quaternion {

	public x: number;
	public y: number;
	public z: number;
	public w: number;

	constructor( x?: number, y?: number, z?: number, w?: number ) {

		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 1;

		this.set( x, y, z, w );

	}

	public set( x?: number, y?: number, z?: number, w?: number ) {

		this.x = x ?? this.x;
		this.y = y ?? this.y;
		this.z = z ?? this.z;
		this.w = w ?? this.w;

	}

	public setFromEuler( euler: Vector | IVector3, order: EulerOrder = 'XYZ' ) {

		const sx = Math.sin( euler.x / 2 );
		const sy = Math.sin( euler.y / 2 );
		const sz = Math.sin( euler.z / 2 );

		const cx = Math.cos( euler.x / 2 );
		const cy = Math.cos( euler.y / 2 );
		const cz = Math.cos( euler.z / 2 );

		if ( order == 'XYZ' ) {

			this.x = cx * sy * sz + sx * cy * cz;
			this.y = - sx * cy * sz + cx * sy * cz;
			this.z = cx * cy * sz + sx * sy * cz;
			this.w = - sx * sy * sz + cx * cy * cz;

		} else if ( order == 'XZY' ) {

			this.x = - cx * sy * sz + sx * cy * cz;
			this.y = cx * sy * cz - sx * cy * sz;
			this.z = sx * sy * cz + cx * cy * sz;
			this.w = sx * sy * sz + cx * cy * cz;

		} else if ( order == 'YZX' ) {

			this.x = sx * cy * cz + cx * sy * sz;
			this.y = sx * cy * sz + cx * sy * cz;
			this.z = - sx * sy * cz + cx * cy * sz;
			this.w = - sx * sy * sz + cx * cy * cz;

		} else if ( order == 'ZYX' ) {

			this.x = sx * cy * cz - cx * sy * sz;
			this.y = sx * cy * sz + cx * sy * cz;
			this.z = - sx * sy * cz + cx * cy * sz;
			this.w = sx * sy * sz + cx * cy * cz;

		}

		return this;

	}

	// http://marupeke296.sakura.ne.jp/DXG_No58_RotQuaternionTrans.html

	public setFromMatrix( matrix: Matrix ) {

		const elm = matrix.elm;

		const trace = elm[ 0 ] + elm[ 5 ] + elm[ 10 ];
		let qx, qy, qz, qw;

		if ( trace > 0 ) {

		  const s = Math.sqrt( trace + 1.0 ) * 2;
		  qw = 0.25 * s;
		  qx = ( elm[ 6 ] - elm[ 9 ] ) / s;
		  qy = ( elm[ 8 ] - elm[ 2 ] ) / s;
		  qz = ( elm[ 1 ] - elm[ 4 ] ) / s;

		} else if ( elm[ 0 ] > elm[ 5 ] && elm[ 0 ] > elm[ 10 ] ) {

		  const s = Math.sqrt( 1.0 + elm[ 0 ] - elm[ 5 ] - elm[ 10 ] ) * 2;
		  qw = ( elm[ 6 ] - elm[ 9 ] ) / s;
		  qx = 0.25 * s;
		  qy = ( elm[ 1 ] + elm[ 4 ] ) / s;
		  qz = ( elm[ 2 ] + elm[ 8 ] ) / s;

		} else if ( elm[ 5 ] > elm[ 10 ] ) {

		  const s = Math.sqrt( 1.0 + elm[ 5 ] - elm[ 0 ] - elm[ 10 ] ) * 2;
		  qw = ( elm[ 8 ] - elm[ 2 ] ) / s;
		  qx = ( elm[ 1 ] + elm[ 4 ] ) / s;
		  qy = 0.25 * s;
		  qz = ( elm[ 6 ] + elm[ 9 ] ) / s;

		} else {

		  const s = Math.sqrt( 1.0 + elm[ 10 ] - elm[ 0 ] - elm[ 5 ] ) * 2;
		  qw = ( elm[ 1 ] - elm[ 4 ] ) / s;
		  qx = ( elm[ 2 ] + elm[ 8 ] ) / s;
		  qy = ( elm[ 6 ] + elm[ 9 ] ) / s;
		  qz = 0.25 * s;

		}

		const length = Math.sqrt( qx * qx + qy * qy + qz * qz + qw * qw );
		qx /= length;
		qy /= length;
		qz /= length;
		qw /= length;

		this.x = qx;
		this.y = qy;
		this.z = qz;
		this.w = qw;

		return this;

	}

	public multiply( q: Quaternion ) {

		const w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;
		const x = this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
		const y = this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x;
		const z = this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w;

		this.set( x, y, z, w );

		return this;

	}

	public inverse() {

		this.set( - this.x, - this.y, - this.z, this.w );

		return this;

	}

	public copy( a: Quaternion | Types.Nullable<IVector4> ) {

		this.x = a.x ?? 0;
		this.y = a.y ?? 0;
		this.z = a.z ?? 0;
		this.w = a.w ?? 0;

		return this;

	}

	public clone() {

		return new Quaternion( this.x, this.y, this.z, this.w );

	}

}
