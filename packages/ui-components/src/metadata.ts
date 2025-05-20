import { getTypeName, Injectable, Type } from '@heliks/tiles-engine';
import { Style } from '@heliks/tiles-ui';


export enum TagType {
  /** Tag wants to render a {@link UiComponent}. */
  Component,
  /** Tag wants to render a {@link UiNode}. */
  Node
}

export interface TagOptions {

  /**
   * A default style that if defined, will be applied to the tags' node when it is
   * created. User defined styles are applied after.
   *
   * Note: When a custom {@link UiNodeRenderer} is used, this functionality must be
   * implemented manually to have any effect.
   */
  style?: Partial<Style>;

}

export interface TagMetadata {
  tag: string;
  type: TagType;
  options: TagOptions;
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
export function Tag(tag: string, options: TagOptions = {}): Function {
  return function tagDecorator(target: Type): void {
    setTagMetadata(target, {
      options,
      tag,
      type: TagType.Node
    });
  }
}

/**
 * Adds component metadata to a {@link UiComponent}.
 *
 * This enables dependency injection on the decorated object.
 *
 * @see UiComponent
 */
export function Component(tag: string, options: TagOptions = {}): Function {
  return function componentDecorator(target: Type): void {
    setTagMetadata(target, {
      options,
      tag,
      type: TagType.Component
    });
  }
}

