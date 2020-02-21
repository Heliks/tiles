import { Container, InjectorToken } from '@tiles/injector';
import { ClassType } from '@tiles/common';

/** A custom value that can be injected via DI in services of this module. */
export interface CustomProvider {
  /** The token that should be used to bind */
  token: InjectorToken;
  value: unknown;
}

export type Provider = ClassType<unknown> | CustomProvider;

/** Available options that can be passed into a module. */
export interface ModuleOptions {
  /**
   * Modules on which this module depends on. These dependencies will not be
   * resolved, but instead are used to validate if this module can be created
   * or if a dependency requires initialization first.
   */
  imports?: ClassType<unknown>[];
  /**
   * Services and other staff that is provided by this module. They can be
   * injected between themselves via DI, but their declaration order matters.
   */
  provides?: Provider[];
  /**
   * Services that should be made available for other modules. Must be provided
   * via {@link provides()} first.
   *
   * ```ts
   * {
   *   // ...
   *   exports: [
   *     ExportedService
   *   ],
   *   // Private service should not be available for other modules.
   *   provides: [
   *     ExportedService,
   *     PrivateService
   *   ]
   * }
   * ```
   */
  exports?: ClassType<unknown>[];
}

/** Data required to create a full module. */
export interface ModuleData extends ModuleOptions {
  /** The module class. */
  module: ClassType<unknown>;
}

export interface Module {
  /** The private service container of this module. */
  container: Container;
  /** The module class. */
  module: unknown;
}
