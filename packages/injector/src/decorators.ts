import { BindingSymbol } from './types';
import { getMetadata, setMetadata } from './utils';

/**
 * Decorator to make a class "injectible".
 *
 * ```typescript
 *
 * class ServiceA {}
 * class ServiceB {}
 *
 * const container = new Container()
 *      .instance(new ServiceA())
 *      .instance(new ServiceB());
 *
 * @injectible()
 * class Foo {
 *     constructor(a: ServiceA, b: ServiceB) {}
 * }
 *
 * class Bar {
 *     constructor(a: ServiceA, b: ServiceB) {}
 * }
 *
 * // Creates a new instance of "Foo".
 * const foo = container.make(Foo);
 *
 * // Throws an error because "Bar" is not injectible.
 * const bar = container.make(Bar);
 * ```
 *
 * @returns ClassDecorator
 */
export function Injectable(): ClassDecorator {
  return (target: Function): void => {
    const metaData = getMetadata(target);

    metaData.params = Reflect.getMetadata('design:paramtypes', target) || [];

    setMetadata(target, metaData);
  };
}

/**
 * Decorator to manually set which symbol should be injected at the target.
 *
 * ```ts
 * @Injectable()
 * class Foo {
 *     // Manually set that we want to inject the `'hello'` symbol into
 *     // the `text` property.
 *     constructor(@Inject('hello') public text: string) {}
 * }
 *
 * const foo = new Container()
 *      .bind('text', 'hello')
 *      .make(Foo);
 *
 * // Logs "Hello World".
 * console.log(foo.text);
 * ```
 *
 * Injections can be optional, meaning that if the binding symbol can not
 * be resolved `undefined` will be injected instead.
 *
 * ```ts
 * @Injectable()
 * class Foo {
 *     // Make the text optional
 *     constructor(@Inject('hello', true) public text?: string) {}
 * }
 * ```
 * const foo = new Container()
 *      .bind('text', 'hello')
 *      .make(Foo);
 *
 * // Logs "undefined".
 * console.log(foo.text);
 * ```
 */
export function Inject(symbol: BindingSymbol, optional = false): ParameterDecorator {
  return (target: object, key: string | symbol, index: number) => {
    const metaData = getMetadata(target);

    if (!metaData.paramOverrides) {
      metaData.paramOverrides = [];
    }

    metaData.paramOverrides.push({
      index,
      key,
      optional,
      symbol
    });

    setMetadata(target, metaData);
  };
}

/**
 * Decorator that is a nicer way of writing `@Inject('foo', true)`
 * @see Inject()
 */
export function Optional(symbol: BindingSymbol): ParameterDecorator {
  // eslint-disable-next-line new-cap
  return Inject(symbol, true);
}

