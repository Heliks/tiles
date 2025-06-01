import { getTypeName, Injectable, Type } from '@heliks/tiles-engine';
import { Style } from '@heliks/tiles-ui';


/** Available categories of UI resources. */
export enum ResourceType {
  /** Resource is a {@link UiComponent} with a selector. */
  Component,
  /** Resource is a {@link UiComponent} used as a JSX class component. */
  ComponentStandalone,
  /** Resource is created by a {@link UiNodeRenderer}. */
  Node
}

/** Metadata that is shared by all UI resources. */
export interface ResourceOptions {

  /**
   * A default style that if defined, will be applied to the UI resource after it has
   * been created. User defined styles are applied after.
   *
   * Note: When a custom {@link UiNodeRenderer} is used, this functionality must be
   * implemented manually to have any effect.
   */
  style?: Partial<Style>;

}

/** Metadata for standalone components. */

/** Metadata for nodes with a selector. */
export interface SelectorMetadata {
  options: ResourceOptions;
  selector: string;
  type: ResourceType.Component | ResourceType.Node;
}

/** Metadata for nodes that are rendered based on their tag name. */
export interface StandaloneComponentMetadata {
  options: ResourceOptions;
  type: ResourceType.ComponentStandalone;
}

export type ResourceMetadata = SelectorMetadata | StandaloneComponentMetadata;

const NODE_METADATA_KEY = Symbol();


export function setResourceMetadata(target: Type, metadata: ResourceMetadata): void {
  // Make class injectable.
  Injectable()(target);

  Reflect.defineMetadata(NODE_METADATA_KEY, metadata, target);
}

export function getResourceMetadata(target: Type): ResourceMetadata {
  const data = Reflect.getMetadata(NODE_METADATA_KEY, target);

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
export function Tag(tag: string, options: ResourceOptions = {}): Function {
  return function tagDecorator(target: Type): void {
    setResourceMetadata(target, {
      options,
      selector: tag,
      type: ResourceType.Node
    });
  }
}


/**
 * Adds metadata to a {@link UiComponent}.
 *
 * This will make the component {@link Injectable}.
 */
export function Component(selector: string, options?: ResourceOptions): Function;

/**
 * Adds metadata to a standalone {@link UiComponent}.
 *
 * This will make the component {@link Injectable}.
 */
export function Component(options?: ResourceOptions): Function;

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Component(...attributes: any[]): Function {
  return function componentDecorator(target: Type): void {
    let selector;
    let options;

    const [p1, p2] = attributes;

    if (p1) {
      if (typeof p1 === 'string') {
        selector = p1;

        if (p2) {
          options = p2;
        }
      }
      else {
        options = p1;
      }
    }

    // Fallback options.
    options = options ?? {};

    if (selector) {
      setResourceMetadata(target, {
        type: ResourceType.Component,
        options,
        selector
      });
    }
    else {
      setResourceMetadata(target, {
        type: ResourceType.ComponentStandalone,
        options
      });
    }
  }
}

