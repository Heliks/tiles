import { InjectionMetaData, InjectorToken, METADATA_KEY } from './types';

export function getMetadata(target: object): InjectionMetaData {
  return Reflect.getMetadata(METADATA_KEY, target) || {};
}

export function setMetadata(target: object, data: InjectionMetaData): void {
  Reflect.defineMetadata(METADATA_KEY, data, target);
}

export function stringifyToken(token: InjectorToken): string {
  // Convert the token to a string.
  const str = token.toString();

  // If the token is a constructor we try to return the class name.
  // token.constructor.name does not work in all environments, hence why
  // we have to hack this together here.
  if (token.constructor && str.startsWith('class')) {
    return str.split(' ')[1];
  }

  return str;
}
