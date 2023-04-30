import { Types, Vector } from '..';
import { FCurve } from './FCurve';
import { EventEmitter } from '../utils/EventEmitter';

export class FCurveGroup extends EventEmitter {

	public name: string;

	private curves: Map<Types.RecommendString<Types.Axis>, FCurve>;

	public frameStart: number;
	public frameEnd: number;
	public frameDuration: number;
	private updatedFrame: number = - 1;

	public value: Vector;

	constructor( name?: string, x?: FCurve, y?: FCurve, z?: FCurve, w?: FCurve ) {

		super();

		this.name = name || '';

		this.frameStart = 0;
		this.frameEnd = 0;
		this.frameDuration = 0;

		this.curves = new Map();

		this.value = new Vector();

		if ( x ) this.setFCurve( x, 'x' );
		if ( y ) this.setFCurve( y, 'y' );
		if ( z ) this.setFCurve( z, 'z' );
		if ( w ) this.setFCurve( w, 'w' );

	}

	public setFCurve( curve: FCurve, axis: Types.RecommendString<Types.Axis> ) {

		this.curves.set( axis, curve );

		let minStart = Infinity;
		let maxEnd = - Infinity;

		this.curves.forEach( curve => {

			if ( curve.frameStart < minStart ) {

				minStart = curve.frameStart;

			}

			if ( curve.frameEnd > maxEnd ) {

				maxEnd = curve.frameEnd;

			}

		} );

		if ( minStart == - Infinity || maxEnd == Infinity ) {

			minStart = 0;
			maxEnd = 1;

		}

		this.frameStart = minStart;
		this.frameEnd = maxEnd;
		this.frameDuration = this.frameEnd - this.frameStart;

	}

	public getFCurve( axis: Types.RecommendString<Types.Axis> ) {

		return this.curves.get( axis ) || null;

	}

	public setFrame( frame: number ) {

		if ( frame == this.updatedFrame ) return this;

		const x = this.curves.get( 'x' );
		const y = this.curves.get( 'y' );
		const z = this.curves.get( 'z' );
		const w = this.curves.get( 'w' );

		if ( x ) this.value.x = x.getValue( frame );
		if ( y ) this.value.y = y.getValue( frame );
		if ( z ) this.value.z = z.getValue( frame );
		if ( w ) this.value.w = w.getValue( frame );

		this.updatedFrame = frame;

		return this;

	}

}
