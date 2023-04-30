import { gl } from '../Globals';

export class GPUState {

	private canvasWrapperElm: HTMLElement | null;
	private stateElm: HTMLElement | null;

	private memoryElm: HTMLElement;
	private timerElm: HTMLElement;

	private extMemory: any;

	private renderTimeList: {name: string, time: number}[];

	private memoryInterval: number | null;

	constructor() {

		this.canvasWrapperElm = null;
		this.stateElm = null;

		this.memoryInterval = null;

		// memory

		this.memoryElm = document.createElement( 'div' );
		this.memoryElm.style.position = 'absolute';
		this.memoryElm.style.top = '0';
		this.memoryElm.style.left = "0";
		this.memoryElm.style.color = "#fff";
		this.memoryElm.style.fontSize = "10";
		this.memoryElm.style.background = "#0003";
		this.memoryElm.style.pointerEvents = this.memoryElm.style.userSelect = "none";

		this.extMemory = gl.getExtension( 'GMAN_webgl_memory' );

		// render time

		this.timerElm = document.createElement( 'div' );
		this.timerElm.style.position = 'relative';
		this.timerElm.style.width = this.timerElm.style.height = '100%';
		this.timerElm.style.color = "#fff";
		this.timerElm.style.fontSize = "10";
		this.timerElm.style.background = "#0003";

		this.renderTimeList = [];

	}

	public init( canvasWrapperElm: HTMLElement, stateElm: HTMLElement ) {

		this.canvasWrapperElm = canvasWrapperElm;
		this.stateElm = stateElm;

		this.canvasWrapperElm.appendChild( this.memoryElm );
		this.stateElm.appendChild( this.timerElm );

		this.memoryUpdate();

		if ( this.memoryInterval != null ) window.clearInterval( this.memoryInterval );

		this.memoryInterval = window.setInterval( this.memoryUpdate.bind( this ), 500 );

	}

	public memoryUpdate() {

		if ( this.extMemory ) {

			const info = this.extMemory.getMemoryInfo();
			this.memoryElm.innerText = JSON.stringify( info, null, " " );

		}


	}

	public update() {

		let body = '';
		let total = 0;

		for ( let i = 0; i < this.renderTimeList.length; i ++ ) {

			let t = this.renderTimeList[ i ];

			body += `${t.name}:\t${( t.time.toPrecision( 3 ) )} <br/>`;

			total += t.time;


		}

		body += 'total: ' + total.toPrecision( 3 );

		this.timerElm.innerHTML = body;

	}

	public setRenderTime( name: string, time: number ) {

		let found = false;
		for ( let i = 0; i < this.renderTimeList.length; i ++ ) {

			let t = this.renderTimeList[ i ];

			if ( t.name == name ) {

				t.time = time;
				found = true;

				break;

			}

		}

		if ( ! found ) {

			this.renderTimeList.unshift( {
				name, time
			} );

		}

	}

}
