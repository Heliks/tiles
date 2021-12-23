import { InjectorToken } from './types';


export function stringifyToken(token: InjectorToken): string {
  // Convert the token to a string.
  const str = token.toString();

  // If the token is a constructor we try to return the class name.
  // token.constructor.name does not work in all environments, hence why
  // we have to hack this together here.
  if (token.constructor && str.startsWith('class')) {
    return str.split(' ')[1];
  }

  return str;
}

/**
 * Utility function to create a typed `InjectorToken`.
 *
 * ```ts
 * class Foo {}
 *
 * // Create the typed token for "Foo".
 * const tk = token<Foo>();
 *
 * // Both the "bind()" and "get()" function would correctly infer the "Foo"
 * // type from "tk".
 * new Container().bind(tk, new Foo()).get(tk);
 * ```
 *
 * @typeparam T The kind of value that that the token resolves.
 */
export function token<T>(): InjectorToken<T> {
  return Symbol();
}
