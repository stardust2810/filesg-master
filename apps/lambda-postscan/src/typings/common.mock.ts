/**
 * This type is placed individually in each backend service instead of backend-common.
 * The 'jest' namespace is part of jest type package, and is somehow not imported into the services, even when directly imported in backend-common,
 * resulting in compilation error (but no build error).
 */
export type MockService<T> = Record<keyof T, jest.Mock>;

