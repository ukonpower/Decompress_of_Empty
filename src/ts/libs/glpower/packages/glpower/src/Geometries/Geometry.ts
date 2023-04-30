import { BufferType } from "../GLPowerBuffer";
import { Power } from "../Power";
import { Attribute, AttributeBuffer } from "../GLPowerVAO";

type DefaultAttributeName = 'position' | 'uv' | 'normal' | 'index';

export class Geometry {

	public count: number = 0;

	public attributes: {[key: string]: Attribute} = {};

	constructor() {
	}

	public setAttribute( name: DefaultAttributeName | ( string & {} ), array: number[], size: number ) {

		this.attributes[ name ] = {
			array,
			size
		};

		this.updateVertCount();

		return this;

	}

	public getAttribute( name: DefaultAttributeName | ( string & {} ) ) {

		return this.attributes[ name ];

	}

	private updateVertCount() {

		const keys = Object.keys( this.attributes );

		this.count = keys.length > 0 ? Infinity : 0;

		keys.forEach( name => {

			const attribute = this.attributes[ name ];

			if ( name != 'index' ) {

				this.count = Math.min( attribute.array.length / attribute.size, this.count );

			}

		} );

	}

	// ecs

	public getAttributeBuffer( core: Power, name: DefaultAttributeName | ( string & {} ), constructor: Float32ArrayConstructor | Uint16ArrayConstructor, bufferType: BufferType = 'vbo' ): AttributeBuffer {

		const attr = this.getAttribute( name );

		return {
			buffer: core.createBuffer().setData( new constructor( attr.array ), bufferType ),
			size: attr.size,
			count: attr.array.length / attr.size
		};

	}

	public getComponent( power: Power ) {

		const attributes:( Omit<AttributeBuffer, 'count'> & {name: string} )[] = [];

		if ( this.getAttribute( 'position' ) ) {

			attributes.push( { name: 'position', ...this.getAttributeBuffer( power, 'position', Float32Array ) } );

		}

		if ( this.getAttribute( 'uv' ) ) {

			attributes.push( { name: 'uv', ...this.getAttributeBuffer( power, 'uv', Float32Array ) } );

		}

		if ( this.getAttribute( 'normal' ) ) {

			attributes.push( { name: 'normal', ...this.getAttributeBuffer( power, 'normal', Float32Array ) } );

		}

		return {
			attributes,
			index: this.getAttributeBuffer( power, 'index', Uint16Array, 'ibo' )
		};

	}

}
