import { World } from "@tiles/engine";
import { DisplayObject } from 'pixi.js';

/** Plugin that can be added to the renderer. */
export interface RendererPlugin {

  /**
   * Called once on each frame after all built-in rendering systems have
   * finished.
   */
  update(world: World): void;

}


