import { Entity, World } from '@heliks/tiles-engine';
import { JsxNode } from './jsx-node';


/**
 * Implementation of a UI component.
 *
 * UI components are a high-level building block for UI composition and provide a more
 * traditional web API on top of the {@link UiNode} system.
 *
 * Components come in two different types. Standalone components and selector based
 * components. Both types must be decorated with the {@link Component} decorator. The
 * recommended approach in most scenarios are standalone components.
 *
 * ## Selector based components
 *
 * Selector based components are declared by using the components' selector as the tag of
 * the JSX element Selector based components must be added to the {@link TagRegistry}
 * before they can be used. Otherwise, the renderer will give an error.
 *
 * ```tsx
 *  @Component('foo')
 *  class Foo implements UiComponent {
 *    render() {
 *      return <div>Hello World</div>;
 *    }
 *  }
 *
 *  @Component('bar')
 *  class Bar implements UiComponent {
 *    render() {
 *      // The Foo component is declared by using the selector as tag.
 *      return '<foo />';
 *    }
 *  }
 *
 *  // Add the components the UiComponentsBundle
 *  runtime().bundle(
 *    new UiComponentsBundle({
 *      components: [
 *        Foo,
 *        Bar
 *      ]
 *    })
 *  );
 * ```
 *
 * ## Standalone Components
 *
 * Standalone components act like regular selector based components, with the difference
 * that they do not have a selector and therefore can be used without being added to the
 * {@link TagRegistry}. They are declared by using the components' type as tag of the
 * JSX element itself.
 *
 * ```tsx
 *  @Component()
 *  class Foo implements UiComponent {}
 *
 *  // Standalone components are declared with value based JSX elements.
 *  const content = <Foo />;
 * ```
 *
 * ## Inputs
 *
 * Values can be passed into components via attributes. They can either be bound to the
 * components {@link props} as value or as a reference with a getter. Normal values are
 * passed into the component once and don't change. Referenced values are updated live.
 *
 * ```tsx
 *  class Foo implements UiComponent {
 *    props!: {
 *      bar: number;
 *    };
 *  }
 *
 *  // Pass the bar attribute into the component as a value
 *  <Foo bar={Math.random()} />
 * ```
 *
 * The JSX renderer will treat the `props` object of a component as context for its
 * underlying {@link UiElement}. Non-standard attributes that are passed into the JSX
 * element are treated as inputs. Consequently, when the `props` object receives an
 * input, the {@link OnChanges} lifecycle will be triggered on the UI component.
 *
 * ```tsx
 *  class Foo implements UiComponent, OnChanges {
 *    props!: {
 *      bar: number;
 *    };
 *
 *    onChanges() {
 *      // Every time the input of "bar" changes, this OnChanges lifecycle will be
 *      // triggered as well.
 *      console.log(this.props.bar);
 *    }
 *  }
 *
 *  <Foo bar={bind(() => Math.random())} />
 * ```
 *
 * Todo: Lifecycle
 */
export interface UiComponent<P extends object = object> {

  /**
   * Properties that are expected to be passed into this component as attributes. The
   * type of this object determines type safety when this component is used as a JSX
   * element.
   */
  props?: P;

  /**
   * Returns the node tree that is rendered by this component.
   *
   * ## Expressions
   *
   * JSX allows any type of value inside the curly brace syntax. If the renderer does
   * not know how to handle a certain type, it will be converted into a string. Objects
   * will be parsed with `JSON.stringify`. Additionally, `undefined` is ignored.
   *
   * ### Functions
   *
   * Functions are called when their parent node is rendered. This allows them to insert
   * additional content into the component view.
   *
   * ```tsx
   *  class Foo implements UiComponent {
   *
   *    public lazy(): Node {
   *      return <div>Hello World</div>
   *    }
   *
   *    public render(): Node {
   *      return (
   *        <div>
   *          {() => this.lazy()}
   *        </div>
   *      );
   *    }
   *
   *  }
   * ```
   *
   * Subsequently, functions can be used to render a part of the component view when
   * a template expression becomes `true`.
   *
   * ```tsx
   *  class Foo implements UiComponent {
   *
   *    @Input()
   *    public message?: string;
   *
   *    public lazy(): Node {
   *      // Render the component message.
   *      return <div>{ this.message }</div>
   *    }
   *
   *    public render(): Node {
   *      // `lazy()` will only be called here after `this.message` has been set.
   *      return (
   *        <div if="message">
   *          {() => this.lazy()}
   *        </div>
   *      );
   *    }
   *
   *  }
   * ```
   *
   * ## Conditional Rendering
   *
   * Parts of the component view can be made optional by leveraging the fact that the
   * renderer ignores `undefined` values.
   *
   * ```tsx
   *  class Foo implements UiComponent {
   *
   *    public condition = false;
   *
   *    public part(): Node | undefined {
   *      if (this.condition) {
   *        return <div>Hello World<div>;
   *      }
   *    }
   *
   *    public render(): Node {
   *      // Since `part()` can return `undefined`, the "Hello World" message is only
   *      // rendered when `this.condition` is true.
   *      return <div>{ this.part() }</div>;
   *    }
   *
   *  }
   * ```
   *
   * @param world Entity world
   * @param entity Entity that owns the component.
   */
  render(world: World, entity: Entity): JsxNode;

  /**
   * If defined, this function will be called once per frame.
   */
  update?(world: World, entity: Entity): void;

}
