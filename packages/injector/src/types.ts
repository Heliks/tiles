
/**
 * Class constructor type.
 * Fixme: This does not work for abstract classes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T = any> = new (...params: any[]) => T;

/**
 * Value that acts as a unique identifier within a {@link Container service container}.
 *
 * The service container accepts most values as tokens. If they are already used by
 * another binding, they are overwritten.
 *
 * - `T`: Type of value that is bound to this token. This only works when the token
 *  is a class {@link Type constructor}.
 */
export type InjectorToken<T = unknown> = symbol | string | number | Type<T> | Function;

/**
 * Factory that creates a value when the {@link Container service container} resolves
 * the token to which it is bound to.
 *
 * Factories come in two variants: Factories and singletons. Factories create a value
 * each time their token is resolved. Singleton factories create a value once when the
 * token to which they are bound to is resolved for the first time.
 *
 * - `T`: Type of the value that is produced by this factory.
 * - `C`: Service {@link Container container} calling this factory.
 */
export type ValueFactory<T, C> = (container: C) => T;

/**
 * Immutable version of a service {@link Container}.
 */
export interface ImmutableContainer {

  /** Resolves the given `token`. */
  get<T>(token: InjectorToken<T>): T;

  /** Returns `true` if `token` is bound to this service container. */
  has(token: InjectorToken): boolean;

  /**
   * Creates an instance of the given `type`. If custom `params` are provided they will
   * be added to the right side of the parameter list that is resolved for this type.
   */
  make<T = object>(type: Type<T>, params?: unknown[]): T;

}

/**
 * A service container is responsible for managing dependencies and performing dependency
 * injection on valid types (e.g. class constructors).
 */
export interface Container extends ImmutableContainer {

  /**
   * Binds `value` to token.
   *
   * ### Example
   *
   * You can bind any kind of value to a {@link InjectorToken token}. The most common use
   * case is to bind the instance of a class to its own type:
   *
   * ```typescript
   * container.bind(Foo, new Foo());
   *
   * // => true
   * console.log(container.get(Foo) instanceof Foo);
   * ```
   */
  bind<T>(token: InjectorToken<T>, value: T): this;

  /**
   * Removes any value bound to `token` from the service container.
   *
   * ```ts
   *  class Foo {}
   *
   *  container.bind(Foo, new Foo());
   *
   *  const foo = container.get(Foo);
   *
   *  container.unbind(Foo);
   *
   *  // Will throw, because "Foo" is no longer bound to the service container.
   *  container.get(Foo);
   * ```ts
   */
  unbind<T>(token: InjectorToken<T>): this;

  /**
   * Binds one or more instances to their own class type.
   *
   * ### Example
   *
   * ```typescript
   * container.instance(new Foo())
   *
   * // => true
   * console.log(container.get(Foo) instanceof Foo);
   * ```
   */
  instance<T extends object>(...instances: T[]): this;

  /**
   * Binds a `factory` that should be resolved the first time that the token is requested
   * from the service container. Subsequent requests will return that same value.
   *
   * ### Example
   *
   * ```typescript
   *  const token = Symbol();
   *
   *  let i = 1;
   *
   *  function myFactory(): number {
   *    return i++;
   *  }
   *
   *  container.singleton(token, myFactory);
   *
   *  console.log(container.get(token)); // => 1
   *  console.log(container.get(token)); // => 1
   * ```
   */
  singleton<T>(token: InjectorToken<T>, factory: ValueFactory<T, Container>): this;

  /**
   * Binds a `factory` that is resolved every time that `token` is requested from the
   * service container.
   *
   * ### Example
   *
   * ```ts
   * const token = new Symbol();
   *
   * let i = 1;
   *
   * container.factory(token, () => i++);
   *
   * console.log(container.get(token)); // 1
   * console.log(container.get(token)); // 2
   * ```
   */
  factory<T>(token: InjectorToken<T>, factory: ValueFactory<T, Container>): this;

  /**
   * Merges the given `container` into this one.
   *
   * ```ts
   * const a = new Container().bind('foo', true);
   * const b = new Container().bind('bar', true);
   *
   * a.merge(b);
   *
   * console.log(a.get('foo')) // true
   * console.log(a.get('bar')) // true
   * ```
   */
  merge(container: Container): this;

}

export interface Binding<T = unknown> {

  /**
   * Resolves the binding.
   *
   * @param container The container that attempts to resolve the binding.
   * @returns
   */
  resolve(container: Container): T;

}

export interface ParamInjection {
  /** The symbol that should be injected. */
  token: InjectorToken;
  /** The index of the parameter in the parameter list. */
  index: number;
  /** If `true` the container will pass `undefined` if a binding can not be resolved. */
  optional: boolean;
  /** The property key of the parameter. */
  key: string | symbol;
}


