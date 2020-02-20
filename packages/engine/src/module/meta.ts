import { ModuleOptions } from './types';
import { Injectable } from '@tiles/injector';

/** The key used to store module metadata on classes. */
export const MODULE_METADATA_KEY = Symbol('module:metadata');

/** Returns the `ModuleOptions` metadata of `target` if it exists or `undefined`. */
export function getModuleMetadata(target: object): ModuleOptions | undefined {
  return Reflect.getMetadata(MODULE_METADATA_KEY, target);
}

/** Sets the `ModuleOptions` metadata of `target`. */
export function setModuleMetadata(target: object, options: ModuleOptions) {
  Reflect.defineMetadata(MODULE_METADATA_KEY, options, target);
}

/**
 * Declares a class as a module.
 *
 * ```ts
 * @ModuleDesc() class Foo {}
 * @ModuleDesc() class Bar {}
 * ```
 *
 * @see ModuleOptions
 * @see Injectable
 *
 * @param declaration (optional) Module metadata.
 * @returns A class decorator
 */
export function ModuleDesc(declaration: ModuleOptions = {}): ClassDecorator {
  return (target: Function): void => {
    setModuleMetadata(target, declaration);
    // Make module classes injectable.
    Injectable()(target);
  };
}
