import { Entity, World } from '@heliks/tiles-engine';
import { JsxNode } from './jsx-node';


/**
 * Implementation of a UI component.
 *
 * UI components next to {@link ElementFactory elements}, are the fundamental building
 * block for UI composition and provide a more traditional event-based API on top of
 * the UI node graph.
 *
 * Each component must be decorated with the {@link Component} decorator and registered
 * on the {@link UiComponentsBundle} before it can be used.
 *
 * ```tsx
 *  // Declare the component.
 *  @Component('foo')
 *  class MyComponent implements UiComponent {
 *    render() {
 *      return <div>Hello World</div>;
 *    }
 *  }
 *
 *  // Add it to the UiComponentsBundle when creating the game runtime.
 *  runtime()
 *    // ...
 *    .bundle(
 *      new UiComponentsBundle()
 *        .add(MyComponent)
 *    );
 * ```
 *
 * UI components can control their behavior by implementing UI lifecycle events.
 */
export interface UiComponent {

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
  update?(world: World): void;

}
