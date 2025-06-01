/**
 * Important:
 *
 * This file is required by the typescript transpiler for JSX typings. It can not be
 * moved or renamed, as it assumes a module name "jsx-runtime" contained in the root
 * directory of the library.
 */
import { Style } from '@heliks/tiles-ui';
import { Attributes, JSX_NODE_MARKER, JsxNode, JsxTag } from './jsx-node';
import { UiComponent } from './ui-component';


/** Statically compiled params that will be passed into the {@link jsx} factory. */
type NodeParams = Attributes & {
  children?: JsxNode | JsxNode[];
}

declare global {
  // Safety: Typescript requires this namespace for JSX resolution as per spec.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    /** Definition for JSX nodes that are tags. <div>, <span>, etc. */
    type Element = JsxNode;

    /** Interface for JSX nodes that are components. */
    type Component = UiComponent

    /** Property in 'props' that will contain the nodes children. */
    interface ElementChildrenAttribute {
      children: JsxNode[];
    }

    /** Common attributes present on all elements and components. */
    interface IntrinsicAttributes {
      readonly style?: Partial<Style>;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }

    interface ElementAttributesProperty {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: any;
    }

    /** Common attributes present on all components.*/
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicClassAttributes {}

    /** Available HTML elements. <div>, <span>, etc.  */
    interface IntrinsicElements {
      [key: string]: IntrinsicAttributes
    }
  }
}

/**
 * Fallback object for empty attributes. Attributes are readonly, therefore, this can
 * be re-used by all tags without attributes.
 */
const EMPTY_ATTRIBUTES: Attributes = {};

/**
 * Fallback object for empty children. Children are readonly, therefore, this can
 * be re-used by all tags without children.
 */
const EMPTY_CHILDREN: readonly JsxNode[] = [];

/** @internal */
export function getChildren(params: NodeParams): readonly JsxNode[] {
  if (params.children) {
    return Array.isArray(params.children) ? params.children : [ params.children ];
  }

  return EMPTY_CHILDREN;
}

/**
 * Implementation of the JSX factory.
 * @see https://www.typescriptlang.org/docs/handbook/jsx.html
 */
export function jsx(tag: JsxTag, params: NodeParams): JsxNode {
  if (typeof tag !== 'string') {
    // throw new Error('Class or function components are not supported.');
  }

  return {
    $$node: JSX_NODE_MARKER,
    attributes: params ?? EMPTY_ATTRIBUTES,
    children: getChildren(params),
    tag
  }
}

// React exposes "jsxs" as a variant to "take advantage of static children", but doesn't
// actually do anything with it. We do the same and simply re-export "jsx" as "jsxs".
export { jsx as jsxs };

