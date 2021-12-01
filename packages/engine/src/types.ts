/** A constructor type that produces instances of type `T` */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T = any> = new (...params: any[]) => T;

/** Basic data structure. */
export interface Struct<T = unknown> {
  [key: string]: T;
}

/** Type alias for a string in a UUID format. */
export type UUID = string;
