import { World } from '@heliks/tiles-engine';

/** Plugin that can be added to the renderer. */
export interface RendererPlugin {

  /**
   * Called once on each frame after all built-in rendering systems have
   * finished.
   */
  update(world: World): void;

}

