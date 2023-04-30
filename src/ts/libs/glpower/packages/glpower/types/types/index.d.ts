export declare namespace Types {
    type Nullable<T> = {
        [P in keyof T]?: T[P];
    };
    type RecommendString<T extends string> = T | (string & {});
    type Uniform<T> = {
        value: T;
    };
    type Axis = "x" | "y" | "z" | "w";
}
//# sourceMappingURL=index.d.ts.map