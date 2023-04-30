export namespace Types {

	export type Nullable<T> = {
		[P in keyof T]?: T[P];
	};

	export type RecommendString<T extends string> = T | ( string & {} )

	export type Uniform<T> = {
		value: T
	}

	export type Axis = "x" | "y" | "z" | "w"

}
