import * as GLP from 'glpower';

export class ProgramManager {

	private power: GLP.Power;
	private pool: Map<string, GLP.GLPowerProgram>;

	constructor( core: GLP.Power ) {

		this.power = core;
		this.pool = new Map();

	}

	public get( vertexShader: string, fragmentShader: string ) {

		const id = vertexShader + fragmentShader;

		const programCache = this.pool.get( id );

		if ( programCache !== undefined && programCache.program ) {

			return programCache;

		}

		const program = new GLP.GLPowerProgram( this.power.gl );

		program.setShader( vertexShader, fragmentShader );

		this.pool.set( id, program );

		return program;

	}


}
