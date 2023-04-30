
type ListenerFunction = Function;

type Listener = {
	event: string,
	cb: ListenerFunction;
	once?: boolean
}

export class EventEmitter {

	private listeners: Listener[];

	constructor() {

		this.listeners = [];

	}

	public on( event: string, cb: ListenerFunction ) {

		this.listeners.push( {
			event,
			cb
		} );

	}

	public once( event: string, cb: ListenerFunction ) {

		this.listeners.push( {
			event,
			cb,
			once: true
		} );

	}

	public off( event: string, cb: ListenerFunction ) {

		this.listeners = this.listeners.filter( l => {

			return ! ( l.event == event && l.cb == cb );

		} );

	}

	public emit( event: string, args?: any[] ) {

		const tmpListener = this.listeners.concat();

		for ( let i = 0; i < tmpListener.length; i ++ ) {

			const listener = tmpListener[ i ];

			if ( listener.event == event ) {

				listener.cb.apply( this, args || [] );

				if ( listener.once ) {

					this.off( event, listener.cb );

				}

			}

		}

	}

}
