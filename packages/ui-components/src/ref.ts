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

  /** Contains the referenced {@link Entity} after it has been initialized. */
  public entity?: Entity;

  /**
   * Returns the referenced {@link Entity}. Throws an error if the reference is not
   * yet initialized.
   */
  public get(): Entity {
    if (this.entity === undefined) {
      throw new Error('Invalid reference');
    }

    return this.entity;
  }

}
