import { Type } from '../utils/types';


/** @internal */
const IGNORE_META_KEY = Symbol();

/** Returns `true` if `component` is ignored by serialization.  */
export function isIgnored<T>(component: T): boolean;

/** Returns `true` if a `property` of a `component` is ignored by serialization.  */
export function isIgnored<T, K = keyof T>(component: T, property: K): boolean;

/** @internal */
export function isIgnored<T, K = keyof T>(component: T, property?: K): boolean {
  return Boolean(
    // Safety: This an overload, therefore typescript throws an error, even though this
    // can be called with an undefined property key.
    Reflect.getMetadata(IGNORE_META_KEY, component as Object, property as string)
  );
}

/**
 * Marks a component or a specific property of a component as ignored.
 *
 * Components that are ignored will not be serialized when the entity that owns them
 * are serialized. Simultaneously, ignored properties will be excluded when their
 * component is being serialized.
 *
 * ```ts
 *  // This component will be ignored entirely.
 *  @Ignore()
 *  class Foo {}
 *
 *  // This component will be serialized as an empty object, because its
 *  // only property is ignored.
 *  class Bar {
 *
 *    @Ignore()
 *    public a = 10;
 *
 *  }
 *
 *  const entity = world.create(
 *    new Foo(),
 *    new Bar()
 *  );
 *
 *  const result = world.get(Serializer).serialize(entity);
 *
 *  // {
 *  //    "bar": {}
 *  // }
 *  console.log(result);
 * ```
 */
export function Ignore<C>(): Function {
  return function ignoreDecorator(target: Type<C>, key?: string): void {
    // Safety: This an overload, therefore typescript throws an error, even though this
    // can be called with an undefined property key.
    Reflect.defineMetadata(IGNORE_META_KEY, true, target, key as string);
  }
}
