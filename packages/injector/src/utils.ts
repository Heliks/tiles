import { InjectionMetaData, METADATA_KEY } from './types';

export function getMetadata(target: object): InjectionMetaData {
  return Reflect.getMetadata(METADATA_KEY, target) || {};
}

export function setMetadata(target: object, data: InjectionMetaData): void {
  Reflect.defineMetadata(METADATA_KEY, data, target);
}
