import { BindingFactory, InjectorToken } from "@tiles/injector";
import { ClassType } from "../types";

/** Provides a value to the service container. */
export interface ValueProvider {
  /** The token that can be used to inject [[value]]. */
  token: InjectorToken;
  /** The value that should be bound via [[token]]. */
  value: unknown;
}

/** Provides a factory to the service container. */
export interface FactoryProvider {

  /**
   * The factory that will be used to generate the value of [[token]] when it
   * is injected.
   */
  factory: BindingFactory<unknown>;

  /**
   * If set to `true` the provider will be bound as a singleton, meaning that
   * [[factory]] is only called once to generate the value of [[token]] instead
   * of every time.
   */
  singleton?: boolean;

  /**
   * The token that can be used to inject the value that [[factory]]
   * will generate.
   */
  token: InjectorToken;

}

/**
 * Provides a class that will be instantiated with the service container when the
 * app is started.
 */
export type ClassProvider= ClassType<unknown>;

/** */
export type Provider = ClassProvider | FactoryProvider | ValueProvider;

/** Returns true if `target` is a `FactoryProvider`. */
export function isFactoryProvider(target: Partial<FactoryProvider>): target is FactoryProvider {
  return typeof target.factory === 'function';
}


