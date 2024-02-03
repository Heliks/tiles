import { UiNode } from './ui-node';


/**
 * Adds additional logic or behavior to a {@link UiElement}.
 *
 * Values can be passed into an attribute from the context host of the element to which
 * this attribute is attached to by declaring a property as {@link Input}.
 *
 * Only one input should be defined per attribute. If there is more than one, the context
 * host will send the data to the first one available.
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
