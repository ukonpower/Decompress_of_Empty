const moduleCache = new Map<any, any>();

export const hotGet = ( key: string, module: any ) => {

	let cache = moduleCache.get( key );

	if ( cache ) return cache;

	moduleCache.set( key, module );

	return module;

};

export const hotUpdate = ( key: string, newModule: any ) => {

	moduleCache.set( key, newModule );

	return newModule;

};
