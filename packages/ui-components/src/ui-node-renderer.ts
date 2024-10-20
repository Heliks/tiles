import { Entity, World } from '@heliks/tiles-engine';
import { TextStyle } from '@heliks/tiles-ui';
import { Attributes } from './jsx-node';


/**
 * Renders a JSX node by transforming it into an entity.
 *
 * Additional tag metadata must be provided by adding the {@link Node} decorator to the
 * implementation of this renderer.
 *
 * ```ts
 *  // This implementation renders the tag `<foo>` when registered.
 *  @Tag('foo')
 *  class FooRenderer implements TagRenderer {
 *    // ... Implementation,
 *  }
 * ```
 *
 * Tags are registered by adding them to the {@link TagRegistry}. This can be done either
 * manually, or by adding them to the declarations of the {@link UiComponentsBundle}.
 *
 * ```ts
 *  runtime()
 *    // ...
 *    .bundle(
 *      new UiComponentsBundle({
 *        tags: [
 *          FooRenderer
 *        ]
 *      })
 *    );
 * ```
 */
export interface UiNodeRenderer<A extends Attributes = Attributes> {

  /**
   * Transforms a JSX node into an entity.
   *
   * The entity **must** have a {@link UiNode} component attached to it.
   *
   * @param world Entity world
   * @param attributes Attributes.
   * @param text (optional) Inherited text style.
   */
  render(world: World, attributes: A, text?: TextStyle): Entity;

}
