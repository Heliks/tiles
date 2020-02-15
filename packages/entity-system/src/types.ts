// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T = unknown> = new (...params: any[]) => T;
export type ComponentType<T = unknown> = ClassType<T>;

/** An entity is a unique symbol to which components can be attached to. */
export type Entity = symbol;

/** */
export interface Query {
  contains?: ClassType[];
  excludes?: ClassType[];
}
