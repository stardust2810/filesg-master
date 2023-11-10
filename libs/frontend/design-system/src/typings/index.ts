/**
 * https://stackoverflow.com/questions/69327990/how-can-i-make-one-property-non-optional-in-a-typescript-type
 * Usage: WithRequired<TypeWithOptionalField, keyOfOptionalField>
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
