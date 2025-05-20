import { Entity, World } from '@heliks/tiles-engine';
import { TextStyle } from '@heliks/tiles-ui';
import { Attributes } from './jsx-node';


/**
 * Creates a {@link UiNode} and spawns it into the world.
 *
 * Additional metadata must be provided by adding the {@link Tag} decorator to the
 * renderer implementation.
 *
 * ```ts
 *  // This implementation renders `<foo>` tag when registered.
 *  @Tag('foo')
 *  class FooRenderer implements UiNodeRenderer {}
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
 *        nodes: [
 *          FooRenderer
 *        ]
 *      })
 *    );
 * ```
 */
export interface UiNodeRenderer<A extends Attributes = Attributes> {

  /**
   * Creates an entity that is a {@link UiNode}.
   *
   * @param world Entity world
   * @param attributes Attributes.
   * @param text (optional) Inherited text style.
   */
  render(world: World, attributes: A, text?: TextStyle): Entity;

}
