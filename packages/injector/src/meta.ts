import { InjectorToken, ParamInjection } from './types';

/** Key that is used to store injector meta data on a symbol using `Reflect`. */
export const METADATA_KEY = Symbol();

export interface InjectionMetaData {
  /** Overrides injections of `params`. */
  paramOverrides?: ParamInjection[];
  /** The tokens that should be resolved for constructor parameters. */
  params?: InjectorToken[];
}

export function getMetadata(target: object): InjectionMetaData {
  return Reflect.getMetadata(METADATA_KEY, target) || {};
}

export function setMetadata(target: object, data: InjectionMetaData): void {
  Reflect.defineMetadata(METADATA_KEY, data, target);
}

