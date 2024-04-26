import { getTypeName, Injectable, Type } from '@heliks/tiles-engine';


export enum TagType {
  /** Tag wants to render a {@link UiComponent}. */
  Component,
  /** Tag wants to render a basic {@link UiNode}. */
  Element
}

interface TagMetadata {
  tag: string;
  type: TagType;
}

const TAG_METADATA_KEY = Symbol();


export function setTagMetadata(target: Type, metadata: TagMetadata): void {
  // Make class injectable.
  Injectable()(target);

  Reflect.defineMetadata(TAG_METADATA_KEY, metadata, target);
}

export function getTagMetadata(target: Type): TagMetadata {
  const data = Reflect.getMetadata(TAG_METADATA_KEY, target);

  if (! data) {
    throw new Error('Type ' + getTypeName(target) + ' has no metadata');
  }

  return data;
}

/**
 * Elements have dependency injection enabled by default. Using the {@link Injectable()}
 * decorator separately is not required.
 */
export function Element(tag: string) {
  return function(target: Type) {
    setTagMetadata(target, { tag, type: TagType.Element });
  }
}

/**
 * Components have dependency injection enabled by default. Using the {@link Injectable()}
 * decorator separately is not required.
 */
export function Component(tag: string) {
  return function(target: Type) {
    setTagMetadata(target, { tag, type: TagType.Component });
  }
}

