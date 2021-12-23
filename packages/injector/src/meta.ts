import { InjectorToken, ParamInjection } from './types';


export interface InjectionMetaData {
  /** Overrides injections of `params`. */
  paramOverrides?: ParamInjection[];
  /** The tokens that should be resolved for constructor parameters. */
  params?: InjectorToken[];
}

/** Storage for injection metadata. */
const METADATA = new Map<unknown, InjectionMetaData>();

export function getMetadata(target: unknown): InjectionMetaData {
  return METADATA.get(target) ?? {};
}

export function setMetadata(target: unknown, data: InjectionMetaData): void {
  METADATA.set(target, data);
}

