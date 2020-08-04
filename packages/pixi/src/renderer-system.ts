import { Inject, Injectable, System, World } from '@heliks/tiles-engine';
import { Renderer } from './renderer';
import { RENDERER_PLUGINS_TOKEN } from './config';
import { RendererPlugin } from './types';
import { Stage } from './stage';
import { Camera } from './camera';

/** Automatically updates the [[Renderer]] once on each frame. */
@Injectable()
export class RendererSystem implements System {

  /**
   * @param camera [[Camera]]
   * @param plugins Renderer plugins that were registered with the renderer module.
   * @param renderer [[Renderer]]
   * @param stage [[Stage]]
   */
  constructor(
    protected readonly camera: Camera,
    @Inject(RENDERER_PLUGINS_TOKEN)
    protected readonly plugins: RendererPlugin[],
    protected readonly renderer: Renderer,
    protected readonly stage: Stage
  ) {}

  /** @inheritDoc */
  public update(world: World): void {
    // Update each plugin.
    for (const plugin of this.plugins) {
      plugin.update(world);
    }

    // Renders everything to the view.
    this.renderer.update();

    // Clear all debug information immediately after drawing so that the next frame can
    // draw new ones.
    this.renderer.debugDraw.clear();
  }

}
