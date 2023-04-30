import * as GLP from 'glpower';

export class ProgramManager {

	private core: GLP.Power;
	private pool: Map<string, GLP.GLPowerProgram>;

	constructor( core: GLP.Power ) {

		this.core = core;
		this.pool = new Map();

	}

	public get( vertexShader: string, fragmentShader: string ) {

		const id = vertexShader + fragmentShader;

		const programCache = this.pool.get( id );

		if ( programCache !== undefined ) {

			return programCache;

		}

		const program = this.core.createProgram();
		program.setShader( vertexShader, fragmentShader );

		this.pool.set( id, program );

		return program;

	}

}
