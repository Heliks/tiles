import { ComponentType, Storage } from '@heliks/ecs';
import { Inject, InjectorToken } from '@heliks/tiles-injector';
import { Type } from '../types';


/** Returns an injector token for the given `component` type. */
export function getStorageInjectorToken<T extends ComponentType>(component: T): InjectorToken<Storage<T>> {
  return `$.storage.${component.name}`;
}

/** @internal */
function injectComponentStorageDecorator(component: ComponentType): Function {
  return (target: Type, key: string, index: number): void => {
    Inject(getStorageInjectorToken(component))(target, key, index);
  };
}

/**
 * Injects the storage of a `component` into a system or provider. The component must
 * be pre-registered for the storage to be available.
 *
 * ```ts
 *  // Test component
 *  class MyComponent {}
 *
 *  // Provider injecting the storage of `MyComponent`.
 *  class MyProvider {
 *
 *    constructor(
 *      @InjectStorage(MyComponent)
 *      private readonly storage: Storage<MyComponent>
 *    ) {}
 *
 *  }
 *
 *  // Build the game.
 *  new GameBuilder()
 *    .component(MyComponent)
 *    .provider(MyProvider)
 *    .build();
 * ```
 */
export const InjectStorage = injectComponentStorageDecorator;
