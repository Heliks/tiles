import { BindingFactory, InjectorToken } from '@heliks/tiles-injector';
import { ClassType } from '../types';

/**
 * Provides a class that will be instantiated with the service container when the
 * app is started.
 */
export type ClassProvider = ClassType<unknown>;

/** Provides a factory to the service container. */
export interface FactoryProvider {

  /**
   * The factory that will be used to generate the value of [[token]] when it is
   * injected.
   */
  factory: BindingFactory<unknown>;

  /**
   * If set to `true` the provider will be bound as a singleton, meaning that [[factory]]
   * is only called once to generate the value of [[token]] instead of every time.
   */
  singleton?: boolean;

  /**
   * Token that can be used to inject the value that [[factory]] will generate.
   */
  token: InjectorToken;

}

/** Provides a value to the service container. */
export interface ValueProvider {

  /**
   * If this is set to true the [[value]] of this provider is instantiated with the
   * service container first.
   */
  instantiate?: boolean;

  /**
   * Token that can be used to inject [[value]].
   */
  token: InjectorToken;

  /**
   * Value that should be bound via [[token]].
   */
  value: unknown;

}

/** Provides a class instance to the service container via `Container.instance`. */
export interface InstanceProvider {
  instance: object;
}

/** */
export type Provider =
  ClassProvider |
  InstanceProvider |
  FactoryProvider |
  ValueProvider;

/** Checks if `target` is a `InstanceProvider` */
export function isInstanceProvider(target: Provider): target is InstanceProvider {
  return typeof (target as InstanceProvider).instance === 'object';
}

/** Checks if `target` is a `FactoryProvider` */
export function isFactoryProvider(target: Provider): target is FactoryProvider {
  return typeof (target as FactoryProvider).factory === 'function';
}


