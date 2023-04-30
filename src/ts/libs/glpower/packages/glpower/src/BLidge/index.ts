import { EventEmitter } from '../utils/EventEmitter';
import { IVector2, IVector3, Vector } from "../Math/Vector";
import { FCurve } from "../Animation/FCurve";
import { FCurveGroup } from '../Animation/FCurveGroup';
import { FCurveInterpolation, FCurveKeyFrame } from "../Animation/FCurveKeyFrame";

// object

export type BLidgeObjectMessage = {
	n: string,
	prnt: string,
	chld?: BLidgeObjectMessage[],
	anim?: BLidgeAnimation,
	ps: IVector3,
	rt?: IVector3,
	sc?: IVector3,
	mat?: {
		n?: string,
		uni?: BLidgeAnimation
	}
	t: BLidgeObjectType,
	v: boolean,
	prm?: BLidgeCameraParam | BLidgeMeshParam | BLidgeLightParamCommon
}

export type BLidgeObject = {
	name: string,
	parent: string,
	children: BLidgeObject[],
	animation: BLidgeAnimation,
	position: IVector3,
	rotation: IVector3,
	scale: IVector3,
	material: BLidgeMaterialParam
	type: BLidgeObjectType,
	visible: boolean,
	param?: BLidgeCameraParam | BLidgeMeshParam | BLidgeLightParamCommon
}

export type BLidgeObjectType = 'empty' | 'cube' | 'sphere' | 'cylinder' | 'mesh' | 'camera' | 'plane' | 'light';

export type BLidgeCameraParam = {
	fov: number
}

export type BLidgeMeshParam = {
	position: number[],
	uv: number[],
	normal: number[],
	index: number[],
}

export type BLidgeLightParam = BLidgeDirectionalLightParam | BLidgeSpotLightParam;

type BLidgeLightParamCommon = {
	type: 'directional' | 'spot'
	color: IVector3,
	intensity: number,
	shadowMap: boolean,
}

export type BLidgeDirectionalLightParam = {
	type: 'directional'
} & BLidgeLightParamCommon

export type BLidgeSpotLightParam = {
	type: 'spot',
	angle: number,
	blend: number,
} & BLidgeLightParamCommon

// material

export type BLidgeMaterialParam = {
	name: string,
	uniforms: BLidgeAnimation
}

// scene

export type BLidgeSceneData = {
    animations: {[key: string]: BLidgeAnimationCurveParam[]};
	scene: BLidgeObjectMessage;
	frame: BLidgeSceneFrame;
}

// animation

export type BLidgeAnimation = { [key: string]: string }

export type BLidgeAnimationCurveAxis = 'x' | 'y' | 'z' | 'w'

export type BLidgeAnimationCurveParam = {
    k: BLidgeAnimationCurveKeyFrameParam[];
	axis: BLidgeAnimationCurveAxis
}

export type BLidgeAnimationCurveKeyFrameParam = {
    c: IVector2;
    h_l?: IVector2;
    h_r?: IVector2;
    e: string;
    i: "B" | "L" | "C";
}

// message

export type BLidgeMessage = BLidgeSyncSceneMessage | BLidgeSyncFrameMessage

export type BLidgeSyncSceneMessage = {
	type: "sync/scene",
    data: BLidgeSceneData;
}

export type BLidgeSyncFrameMessage = {
	type: "sync/timeline";
	data: BLidgeSceneFrame;
}

export type BLidgeSceneFrame = {
	start: number;
	end: number;
	current: number;
	fps: number;
	playing: boolean;
}

export class BLidge extends EventEmitter {

	// ws

	private url?: string;
	private ws?: WebSocket;
	public connected: boolean = false;

	// frame

	public frame: BLidgeSceneFrame = {
		start: - 1,
		end: - 1,
		current: - 1,
		fps: - 1,
		playing: false,
	};

	// animation

	public objects: BLidgeObject[] = [];
	public curveGroups: FCurveGroup[] = [];
	public scene: BLidgeObject | null;

	constructor( url?: string ) {

		super();

		this.scene = null;

		if ( url ) {

			this.url = url;
			this.connect( this.url );

		}

	}

	public connect( url: string ) {

		this.url = url;
		this.ws = new WebSocket( this.url );
		this.ws.onopen = this.onOpen.bind( this );
		this.ws.onmessage = this.onMessage.bind( this );
		this.ws.onclose = this.onClose.bind( this );

		this.ws.onerror = ( e ) => {

			console.error( e );

			this.emit( 'error' );

		};

	}

	public loadJsonScene( jsonPath: string ) {

		const req = new XMLHttpRequest();

		req.onreadystatechange = () => {

			if ( req.readyState == 4 ) {

				if ( req.status == 200 ) {

					this.loadScene( JSON.parse( req.response ) );

				}

			}

		};

		req.open( 'GET', jsonPath );
		req.send( );

	}

	/*-------------------------------
		Events
	-------------------------------*/

	public loadScene( data: BLidgeSceneData ) {

		// frame

		this.frame.start = data.frame.start;
		this.frame.end = data.frame.end;
		this.frame.fps = data.frame.fps;

		this.curveGroups.length = 0;
		this.objects.length = 0;

		// actions

		const fcurveGroupNames = Object.keys( data.animations );

		for ( let i = 0; i < fcurveGroupNames.length; i ++ ) {

			const fcurveGroupName = fcurveGroupNames[ i ];
			const fcurveGroup = new FCurveGroup( fcurveGroupName );

			data.animations[ fcurveGroupName ].forEach( fcurveData => {

				const curve = new FCurve();

				curve.set( fcurveData.k.map( frame => {

					const interpolation = {
						"B": "BEZIER",
						"C": "CONSTANT",
						"L": "LINEAR",
					}[ frame.i ];

					return new FCurveKeyFrame( frame.c, frame.h_l, frame.h_r, interpolation as FCurveInterpolation );

				} ) );

				fcurveGroup.setFCurve( curve, fcurveData.axis );

			} );

			this.curveGroups.push( fcurveGroup );

		}

		// objects

		this.objects.length = 0;

		const _ = ( objMsg: BLidgeObjectMessage ): BLidgeObject => {

			const mat = { name: '', uniforms: {} };

			if ( objMsg.mat ) {

				mat.name = objMsg.mat.n || '';
				mat.uniforms = objMsg.mat.uni || {};

			}

			const obj: BLidgeObject = {
				name: objMsg.n,
				parent: objMsg.prnt,
				children: [],
				animation: objMsg.anim || {},
				position: objMsg.ps || new Vector(),
				rotation: objMsg.rt || new Vector(),
				scale: objMsg.sc || new Vector(),
				material: mat,
				type: objMsg.t,
				visible: objMsg.v,
				param: objMsg.prm
			};

			if ( objMsg.chld ) {

				objMsg.chld.forEach( item => {

					obj.children.push( _( item ) );

				} );

			}

			this.objects.push( obj );

			return obj;

		};

		this.scene = _( data.scene );

		// dispatch event

		this.emit( 'sync/scene', [ this ] );

	}

	private onSyncTimeline( data: BLidgeSceneFrame ) {

		this.frame = data;

		this.emit( 'sync/timeline', [ this.frame ] );

	}

	/*-------------------------------
		WS Events
	-------------------------------*/

	private onOpen( event: Event ) {

		this.connected = true;

	}

	private onMessage( e: MessageEvent ) {

		const msg = JSON.parse( e.data ) as BLidgeMessage;

		if ( msg.type == 'sync/scene' ) {

			this.loadScene( msg.data );

		} else if ( msg.type == "sync/timeline" ) {

			this.onSyncTimeline( msg.data );

		}

	}

	private onClose( e:CloseEvent ) {

		this.disposeWS();

	}

	/*-------------------------------
		API
	-------------------------------*/

	public getCurveGroup( name: string ) {

		return this.curveGroups.find( curve => curve.name == name );

	}

	public setFrame( frame: number ) {

		this.onSyncTimeline( {
			...this.frame,
			playing: true,
			current: frame,
		} );

	}

	/*-------------------------------
		Dispose
	-------------------------------*/

	public dispose() {

		this.disposeWS();

	}

	public disposeWS() {

		if ( this.ws ) {

			this.ws.close();
			this.ws.onmessage = null;
			this.ws.onclose = null;
			this.ws.onopen = null;

			this.connected = false;

		}

	}

}
