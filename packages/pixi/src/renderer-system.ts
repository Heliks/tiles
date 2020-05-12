import { System } from '@tiles/entity-system';
import { Inject, Injectable } from '@tiles/injector';
import { Renderer } from './renderer';
import { World } from "@tiles/engine";
import { RENDERER_PLUGINS_TOKEN } from "./config";
import { RendererPlugin } from "./types";

/** Automatically updates the [[Renderer]] once on each frame. */
@Injectable()
export class RendererSystem implements System {

  /**
   * @param plugins Renderer plugins that were registered with the renderer module.
   * @param renderer
   */
  constructor(
    @Inject(RENDERER_PLUGINS_TOKEN)
    protected readonly plugins: RendererPlugin[],
    protected readonly renderer: Renderer,
  ) {
    console.log(plugins)
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    // Update each plugin.
    for (const plugin of this.plugins) {
      plugin.update(world);
    }

    // Renders everything to the view.
    this.renderer.update();

    // Clear the debug draw stage so that it can be redrawn on the next frame.
    this.renderer.debugDraw.clear();
  }

}
