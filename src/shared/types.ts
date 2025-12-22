// expands object types one level deep
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
export type ExpandRecursively<T> = T extends Record<string, unknown> | Record<string, unknown>[]
  ? T extends infer O
  ? { [K in keyof O]: ExpandRecursively<O[K]> }
  : never
  : T;

//This will extract the return type of an async function after it has been resolved
export type AsyncFunctionType<T extends (...args: never) => unknown> = ExpandRecursively<
  Awaited<ReturnType<T>>
>;

//return singular type from array type
export type Singular<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

