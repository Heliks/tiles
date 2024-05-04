import { Style } from './style';


/**
 * Values that can be used as a condition for a {@link JsxNode}.
 *
 * - If the condition is a string, it will be treated as the name of a property on the
 *   nodes host context to which the template expression should be bound.
 *
 * ```tsx
 *  class Foo implements UiComponent {
 *
 *    public foo = false;
 *
 *    public render() {
 *      return (
 *        <div>
 *          <div if="foo">This only is rendered when the "foo" property evaluates to `true`</div>
 *        </div>
 *      )
 *    }
 *
 *  }
 * ```
 *
 * - If the condition is a function, it will be directly bound as value to the template
 *   expression.
 */
export type JsxTemplateCondition = string | (() => boolean);

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
   * When set, the {@link JsxNode node} will be conditionally displayed or removed from
   * the document. Conditional nodes are wrapped in a {@link TemplateElement}.
   *
   * - If the condition is a string, it will be treated as the name of a property on the
   *   nodes host context to which the template expression is bound.
   *
   * ```tsx
   *  class MyComponent implements UiComponent {
   *
   *    public foo = false;
   *
   *    public render() {
   *      // This node will only be rendered when `MyComponent.foo` is truthy. Otherwise,
   *      // it will be removed from the document entirely.
   *      return <div if="foo">Hello World</div>
   *    }
   *
   *  }
   * ```
   *
   * - If the condition is a function, it is bound as value to the template expression.
   *
   * ```tsx
   *  class MyComponent implements UiComponent {
   *
   *    public foo = false;
   *
   *    public render() {
   *      // This works the same as the example above and checks `MyComponent.foo` once
   *      // per game tick.
   *      return <div if={() => this.foo}>Hello World</div>
   *    }
   *
   *  }
   * ```
   */
  readonly if?: JsxTemplateCondition;

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
