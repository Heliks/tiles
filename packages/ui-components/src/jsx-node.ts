import { Type } from '@heliks/tiles-engine';
import { Style } from '@heliks/tiles-ui';
import { Ref } from './ref';
import { UiComponent } from './ui-component';


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

/** Default attributes that can be assigned to any {@link JsxNode}. */
export type Attributes = {

  /**
   * If set, assigns a {@link Data} component to the entity of this node, using the
   * value of this attribute as data.
   */
  readonly data?: unknown;

  /**
   * If set to `true`, the node will be able to capture UI interaction events. Events
   * are bubbled by default. Event bubbling can be disabled with the {@link bubble}
   * attribute.
   */
  readonly events?: boolean;

  /**
   * Defines if events should be bubbled from the {@link UiElement} that is rendered
   * by this node. Event bubbling is enabled by default.
   */
  readonly bubble?: boolean;

  /**
   * When set, the node will be conditionally displayed or removed from the document.
   *
   * Conditional nodes are wrapped in a {@link TemplateElement}.
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
   * When set, the entity that will be created in the process of rendering the element
   * will be assigned to this reference.
   */
  readonly ref?: Ref;

  /**
   * Styles to apply to the {@link JsxNode}.
   *
   * ```tsx
   *  const styled = <div style={{ grow: 1 }}>Hello World</div>;
   * ```
   */
  readonly style?: Partial<Style>;

  /** Any other attribute. */
  readonly [name: string]: unknown;

}

/**
 * Valid JSX tags.
 *
 * JSX elements that use a selector are created from {@link TagRegistry} entries and
 * must therefore be registered before they can be used.
 *
 * ```tsx
 * // A tag named "foo" must be known to the TypeRegistry. Otherwise, the JSX renderer
 * // will throw an error.
 * const content = <foo></foo>;
 * ```
 *
 * Value based JSX elements can use a {@link UiComponent}. Both standalone and non -
 * standalone components can be used with this syntax.
 *
 * ```tsx
 *  @Component()
 *  class Foo implements UiComponent {}
 *
 *  @Component('bar')
 *  class Bar implements UiComponent {}
 *
 *  // Both components can be used with the value based syntax.
 *  const content1 = <Foo />;
 *  const content2 = <Bar />;
 * ```
 */
export type JsxTag = string | Type<UiComponent>;

/** @internal */
export const JSX_NODE_MARKER = Symbol();

/** Data representation of a JSX element, a.E.: `<div foo="bar"></div>` */
export interface JsxNode<A extends Attributes = Attributes, T extends JsxTag = JsxTag> {

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

  /** Tag used to create this node. */
  readonly tag: T;

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
