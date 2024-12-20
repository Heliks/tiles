import { getMetadata, setMetadata } from './meta';
import { InjectorToken } from './types';


/**
 * Flags a class as "injectable".
 *
 * ```ts
 * class ServiceA {}
 * class ServiceB {}
 *
 * const container = new Container()
 *      .instance(new ServiceA())
 *      .instance(new ServiceB());
 *
 * @Injectable()
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
 * // Throws an error because "Bar" is not an injectable.
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
 * Decorator that overwrites the token that should be injected.
 *
 * ```ts
 * @Injectable()
 * class Foo {
 *     // Manually set that we want to inject the `'hello'` token into
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
 * Injections can be optional, meaning that if the binding token can not
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
export function Inject(token: InjectorToken, optional = false): ParameterDecorator {
  return (target: object, key: string | symbol | undefined, index: number) => {
    const metaData = getMetadata(target);

    if (!metaData.paramOverrides) {
      metaData.paramOverrides = [];
    }

    metaData.paramOverrides.push({
      index,
      optional,
      token: token
    });

    setMetadata(target, metaData);
  };
}

/**
 * Decorator that is a nicer way of writing `@Inject('foo', true)`
 * @see Inject()
 */
export function Optional(token: InjectorToken): ParameterDecorator {
  // eslint-disable-next-line new-cap
  return Inject(token, true);
}

