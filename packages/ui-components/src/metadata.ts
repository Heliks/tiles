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
 * Marks a {@link ElementFactory element} and defines element metadata on how the
 * element is used during runtime.
 *
 * Elements have dependency injection enabled by default.
 *
 * @see ElementFactory
 */
export function Element(tag: string): Function {
  return function elementDecorator(target: Type): void {
    setTagMetadata(target, { tag, type: TagType.Element });
  }
}

/**
 * Marks a {@link UiComponent} and defines component metadata on how the component is
 * used during runtime.
 *
 * Components have dependency injection enabled by default.
 *
 * @see UiComponent
 */
export function Component(tag: string): Function {
  return function componentDecorator(target: Type): void {
    setTagMetadata(target, { tag, type: TagType.Component });
  }
}

