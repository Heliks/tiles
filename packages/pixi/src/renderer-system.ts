import { Injectable, System, World } from '@heliks/tiles-engine';
import { Renderer } from './renderer';
import { Stage } from './stage';
import { RendererPlugins } from './renderer-plugins';

/** Rendering system responsible for executing the renderer graph. */
@Injectable()
export class RendererSystem implements System {

  constructor(
    private readonly plugins: RendererPlugins,
    private readonly renderer: Renderer,
    private readonly stage: Stage
  ) {}

  /** @inheritDoc */
  public update(world: World): void {
    for (const plugin of this.plugins.items) {
      plugin.update(world);
    }

    // Renders everything to the view.
    this.renderer.update();

    // Clear all debug information immediately after drawing so that the next frame
    // can draw new ones.
    this.renderer.debugDraw.clear();
  }

}
