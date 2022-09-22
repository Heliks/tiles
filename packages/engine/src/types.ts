/** @deprecated Type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T = any> = new (...params: any[]) => T;

/** A type that an object is an instance of. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T = any> = new (...params: any[]) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractType<T = any> = abstract new (...params: any[]) => T;


/** Basic data structure. */
export interface Struct<T = unknown> {
  [key: string]: T;
}

/** Type alias for a string in a UUID format. */
export type UUID = string;
