export type Replace<T, K extends keyof T, R> = Omit<T, K> & { [T in K]: R };
export type CustomPropertyMap = { [name: string]: { path: string; filterOnly?: boolean; ignoreNull?: boolean } };
