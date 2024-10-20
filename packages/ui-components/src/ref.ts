import { Entity } from '@heliks/tiles-engine';


/**
 * A reference to the internal {@link Entity} that is created when rendering a {@link JsxNode}.
 *
 * ```tsx
 *  class MyComponent implements UiNode {
 *    // After the component has been rendered, the entity of the <div> element can
 *    // be accessed here.
 *    public ref = new Ref();
 *
 *    public render(): JsxNode {
 *      return <div ref={this.ref}></div>;
 *    }
 *  }
 * ```
 */
export class Ref {

  /** Contains the referenced entity after it has been initialized. */
  public entity?: Entity;

  /** Returns the referenced entity. */
  public get(): Entity {
    if (this.entity === undefined) {
      throw new Error('Invalid reference');
    }

    return this.entity;
  }

  /** Returns `true` when this is a valid reference to an entity. */
  public valid(): boolean {
    return this.entity !== undefined;
  }

}
