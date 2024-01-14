import { Entity, World } from '@heliks/tiles-engine';


/**
 * Implementation of a UI component.
 *
 * ## Lifecycle
 *
 * Ui components can implement {@link OnInit}.
 */
export interface UiComponent {

  /**
   * The entity must have a {@link UiNode} and transform component attached to it.
   */
  render(world: World): Entity;

}
