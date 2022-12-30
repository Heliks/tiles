import { World } from '@heliks/tiles-engine';


/**
 * A renderer system works similar to a normal system, but instead of being executed
 * by the dispatcher, they are executed by the renderer.
 *
 * Renderer systems are separate to normal systems because if they were part not, it can
 * lead to a case where two systems draw a different state on the same frame because that
 * state was modified between these systems. To avoid this, renderer systems are batched
 * and dispatched together.
 */
export interface RendererSystem {

  /** Called once on each frame before the scene is drawn. */
  update(world: World): void;

}
