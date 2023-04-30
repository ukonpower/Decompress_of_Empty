import * as GLP from 'glpower';

export type PointerEventArgs = {
	pointerEvent: PointerEvent,
	position: GLP.Vector,
	delta: GLP.Vector,
}

export class Pointer extends GLP.EventEmitter {

	protected isTouching: boolean;
	public element: HTMLElement | null = null;

	public position: GLP.Vector;
	public delta: GLP.Vector;

	constructor() {

		super();

		this.position = new GLP.Vector( NaN, NaN );
		this.delta = new GLP.Vector( NaN, NaN );
		this.isTouching = false;

		/*-------------------------------
			WindowEvent
		-------------------------------*/

		const onPointerMove = this.onPointer.bind( this, "move" );
		const onPointerUp = this.onPointer.bind( this, "end" );

		window.addEventListener( 'pointermove', onPointerMove );
		window.addEventListener( 'pointerup', onPointerUp );
		window.addEventListener( "dragend", onPointerUp );

		const onDispose = () => {

			if ( this.element ) this.unregisterElement( this.element );

			window.removeEventListener( 'pointermove', onPointerMove );
			window.removeEventListener( 'pointerup', onPointerUp );
			window.removeEventListener( "dragend", onPointerUp );

			this.off( 'dispose', onDispose );

		};

		this.on( 'dispose', onDispose );


	}

	public registerElement( elm: HTMLElement ) {

		if ( this.element ) this.unregisterElement( this.element );

		this.element = elm;

		const onPointerDown = this.onPointer.bind( this, "start" );

		elm.addEventListener( 'pointerdown', onPointerDown );

		const onUnRegister = ( e: any ) => {

			if ( elm.isEqualNode( e.elm ) ) {

				elm.removeEventListener( 'pointerdown', onPointerDown );

				this.off( 'unregister', onUnRegister );

			}

		};

		this.on( 'unregister', onUnRegister );

	}

	public unregisterElement( elm: HTMLElement ) {

		this.emit( "unregister", [ elm ] );

	}

	public getScreenPosition( windowSize: GLP.Vector ) {

		if ( this.position.x != this.position.x ) return new GLP.Vector( NaN, NaN );

		const p = this.position.clone().divide( windowSize ).multiply( 2.0 ).sub( 1.0 );
		p.y *= - 1;

		return p;

	}

	public getRelativePosition( elm: HTMLElement, screen?: boolean ) {

		const rect: DOMRect = elm.getClientRects()[ 0 ] as DOMRect;

		let x = this.position.x - rect.left;
		let y = this.position.y - rect.top;

		if ( screen ) {

			x /= rect.width;
			y /= rect.height;

		}

		const p = new GLP.Vector( x, y );

		return p;

	}

	protected setPos( x: number, y: number ) {

		if ( this.position.x !== this.position.x || this.position.y !== this.position.y ) {

			this.delta.set( 0, 0 );

		} else {

			this.delta.set( x - this.position.x, y - this.position.y );

		}

		this.position.set( x, y );

	}

	protected onPointer( type: string, e: PointerEvent | DragEvent ) {

		const pointerType = ( e as PointerEvent ).pointerType;

		if ( pointerType != null ) {

			if ( pointerType == 'mouse' && ( e.button == - 1 || e.button == 0 ) ) {

				this.touchEventHandler( e.pageX, e.pageY, type, e as PointerEvent );

			}

		} else {

			this.touchEventHandler( e.pageX, e.pageY, type, e );

		}

	}

	protected touchEventHandler( posX: number, posY: number, type: string, e: TouchEvent | PointerEvent | DragEvent ) {

		let dispatch = false;

		const x = posX - window.pageXOffset;
		const y = posY - window.pageYOffset;

		if ( type == 'start' ) {

			this.isTouching = true;

			this.setPos( x, y );

			this.delta.set( 0, 0 );

			dispatch = true;

		} else if ( type == 'move' ) {

			this.setPos( x, y );

			if ( this.isTouching ) {

				dispatch = true;

			}

		} else if ( type == 'end' ) {

			if ( 'targetTouches' in e ) {

				if ( e.targetTouches.length == 0 ) {

					this.isTouching = false;

				}

			} else {

				this.isTouching = false;

			}

			dispatch = true;

		}

		if ( dispatch ) {

			this.emit( type, [ {
				pointerEvent: e,
				position: this.position.clone(),
				delta: this.delta.clone(),
			} ] );

		}

	}

}
