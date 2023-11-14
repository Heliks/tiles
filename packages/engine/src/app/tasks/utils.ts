import { isType, TypeLike } from '../../utils';


export function getTypeName(type: TypeLike<object>): string {
  return isType(type) ? type.name : type.constructor.name;
}