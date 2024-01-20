import { UiNode } from './ui-node';


/**
 * Adds additional logic or behavior to a {@link UiNode} and by extension, its element.
 *
 * Values can be passed into an attribute from the contextual parents view reference by
 * declaring a property as {@link Input}. Only one input property should be defined per
 * attribute. If there is more than one, it will be sent to the first one defined.
 *
 * ```ts
 *  class Foo implements Attribute {
 *
 *    @Input()
 *    public data!: unknown;
 *
 *    public update(): void {
 *      // Noop
 *    }
 *
 *  }
 * ```
 */
export interface Attribute {

  /**
   * Implementation of the attribute update logic. Will be called once per frame while
   * the attribute is attached to a context.
   */
  update(node: UiNode): void;

}