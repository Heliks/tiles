/** A type that an object is an instance of. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T = any> = new (...params: any[]) => T;

/** In JS, functions can be used as constructors aswell. */
export type Ctor<T = any> = Type<T> | Function;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractType<T = any> = abstract new (...params: any[]) => T;

/** Either a {@link Type type} of `T` or an instance of `T`. */
export type TypeLike<T> = Type<T> | T;

/** Typed class decorator. */
export type ClassDecoratorType<T = unknown> = (ctor: Type<T>) => void;

/** Basic data structure. */
export interface Struct<T = unknown> {
  [key: string]: T;
}

/** A primitive values. */
export type Primitive = string | number | boolean;

/** Returns `true` if `value` is a {@link Primitive}. */
export function isPrimitive(value: unknown): value is Primitive {
  const type = typeof value;

  return type === 'string'
    || type === 'number'
    || type === 'boolean';
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
export function isType<T>(value: TypeLike<T>): value is Type<T> {
  return typeof value === 'function';
}

export function getTypeName(type: TypeLike<object>): string {
  return isType(type) ? type.name : type.constructor.name;
}

