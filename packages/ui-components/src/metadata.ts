import { getTypeName, Injectable, Type } from '@heliks/tiles-engine';


export enum TagType {
  /** Tag wants to render a {@link UiComponent}. */
  Component,
  /** Tag wants to render a {@link UiNode}. */
  Node
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
 * Adds tag metadata to a {@link UiNodeRenderer}.
 *
 * This enables dependency injection on the decorated object.
 *
 * @see UiNodeRenderer
 */
export function Tag(tag: string): Function {
  return function tagDecorator(target: Type): void {
    setTagMetadata(target, { tag, type: TagType.Node });
  }
}

/**
 * Adds component metadata to a {@link UiComponent}.
 *
 * This enables dependency injection on the decorated object.
 *
 * @see UiComponent
 */
export function Component(tag: string): Function {
  return function componentDecorator(target: Type): void {
    setTagMetadata(target, { tag, type: TagType.Component });
  }
}

