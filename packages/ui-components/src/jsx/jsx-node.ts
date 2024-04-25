import { Style } from '../style';


/** List of default attributes that can be assigned to any {@link JsxNode}. */
export type Attributes = {

  /**
   * When set, assigns a {@link Data} component to the entity of this node, using the
   * value of this attribute as data.
   */
  readonly data?: unknown;

  /**
   * If set to `true`, this node will be able to capture UI interaction events. All
   * events bubble.
   */
  readonly events?: boolean;

  /**
   * Conditionally displays the node depending on the value of a host property. If it
   * evaluates to `true`, the node will be shown, if it is `false` it will be removed
   * entirely from a document.
   *
   * Conditional nodes will be wrapped in {@link TemplateElement templates}.
   *
   * ```ts
   *  class MyComponent implements UiComponent {
   *
   *    public foo = false;
   *
   *    public render() {
   *      // The <div> element will be wrapped in a TemplateElement and only renders
   *      // when "foo" evaluates to "true".
   *      return <div if="foo"></div>;
   *    }
   *
   *  }
   * ```
   */
  readonly if?: string;

  /** Specifies a custom name. */
  readonly name?: string;

  /**
   * Styles to apply to the {@link JsxNode}.
   *
   * ```tsx
   *  const styled = <div style={[ grow: 1 }}>Hello World</div>;
   * ```
   */
  readonly style?: Partial<Style>;

  /** Any other attribute. */
  readonly [name: string]: unknown;

}

/** @internal */
export const JSX_NODE_MARKER = Symbol();

/** Data representation of a JSX element, a.E.: `<div foo="bar"></div>` */
export interface JsxNode<A extends Attributes = Attributes> {

  /** @internal */
  $$node: symbol;

  /**
   * Contains all attributes that were passed into the node. The {@link children} of the
   * node are additionally stored as an attribute under the same name.
   *
   * ```jsx
   *  <div foo={1} bar={2}></div>
   * ```
   *
   * Will result in the following attributes:
   *
   * ```json
   *  {
   *    children: [],
   *    foo: 1,
   *    bar: 2
   *  }
   * ```
   *
   * Note: Because children are stored as the key `children`, no attribute named
   * "children" can be used on JSX elements.
   *
   * ```jsx
   *  // This is invalid.
   *  <div children={123}></div>
   * ```
   */
  readonly attributes: A;

  /**
   * Contains all node children. Children can be anything.
   *
   * Contains all nodes and strings that are children of this node. Children are stored
   * additionally as {@link attributes} as the key `children`.
   */
  readonly children: readonly unknown[];

  /** Tag name used for this node. */
  readonly tag: string;

}

/** Returns `true` if `value` is a {@link JsxNode}. */
export function isJsxNode(value: unknown | undefined): value is JsxNode {
  return Boolean(value && (value as JsxNode).$$node === JSX_NODE_MARKER);
}

/** Creates a JSX {@link JsxNode} */
export function createJsxNode(tag: string, attributes = {}, children: unknown[] = []): JsxNode {
  return {
    $$node: JSX_NODE_MARKER,
    attributes,
    children,
    tag
  };
}
