import { getTypeName, Type } from '@heliks/tiles-engine';
import { ElementFactory } from './element-registry';


interface NodeMetadata {
  tag: string;
}

const NODE_META_DATA_KEY = Symbol();

export function Element(tag: string) {
  return function(target: Type) {
    const metadata = {
      tag
    };

    Reflect.defineMetadata(NODE_META_DATA_KEY, metadata, target);
  }
}

export function hasNodeMetadata(target: Type<ElementFactory>) {
  return Reflect.hasMetadata(NODE_META_DATA_KEY, target);
}

export function getNodeMetadata(target: Type): NodeMetadata {
  const data = Reflect.getMetadata(NODE_META_DATA_KEY, target);

  if (! data) {
    throw new Error('Type ' + getTypeName(target) + ' has no metadata');
  }

  return data;
}
