import { World } from "../ecs";


/**
 * A renderer system works similar to a normal system, but instead of being executed
 * by the dispatcher, they are executed by the renderer. Since the engine does not
 * have rendering functionality on its own, these systems are merely registered, but
 * never used. A renderer module (a.E. `@heliks/tiles-pixi`) is required to make use
 * of these systems.
 *
 * Renderer systems are separate because if they were part of the normal system execution
 * order, it can lead to a case where two systems draw a different state on the same
 * frame because that state was modified between these systems. To avoid this, renderer
 * systems are batched together in their own dispatcher.
 *
 * Like other game systems, plugins can implement lifecycle hooks such as `OnInit`.
 */
export interface RendererSystem {

  /** Called once on each frame before the scene is drawn. */
  update(world: World): void;

}
