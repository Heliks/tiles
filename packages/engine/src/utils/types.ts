/** A type that an object is an instance of. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T = any> = new (...params: any[]) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractType<T = any> = abstract new (...params: any[]) => T;

/** Typed class decorator. */
export type ClassDecoratorType<T = unknown> = (ctor: Type<T>) => void;

/** Basic data structure. */
export interface Struct<T = unknown> {
  [key: string]: T;
}
