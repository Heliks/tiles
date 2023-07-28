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


/**
 * Returns `true` if the given `value` is a {@link Type class type}.
 *
 * ```ts
 * class Foo {}
 * class Bar {}
 *
 * console.log(isType(Foo)); // -> true
 * console.log(isType(Bar)); // -> true
 *
 * console.log(isType(new Foo())); // -> false
 * console.log(isType(new Bar())); // -> false
 * ```
 */
export function isType<T>(value: T | Type<T>): value is Type<T> {
  return typeof value === 'function';
}
