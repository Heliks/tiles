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
   * Called once per frame *after* the {@link UiComponentRenderer} update.
   */
  update(world: World): void;

  /**
   * The entity must have a {@link UiNode} and transform component attached to it.
   */
  render(world: World): Entity;

}
