import { Inject, Injectable, System, token, World } from '@heliks/tiles-engine';
import { Renderer } from './renderer';
import { Stage } from './stage';

/** Token where renderer plugins should be provided. */
export const RENDERER_PLUGINS_TOKEN = token<RendererPlugin[]>();

/** Plugin that can be added to the renderer. */
export interface RendererPlugin {

  /** Called once on each frame before the scene is drawn. */
  update(world: World): void;

}

/** Rendering system responsible for executing the renderer graph. */
@Injectable()
export class RendererSystem implements System {

  constructor(
    @Inject(RENDERER_PLUGINS_TOKEN)
    private readonly plugins: RendererPlugin[],
    private readonly renderer: Renderer,
    private readonly stage: Stage
  ) {}

  /** @inheritDoc */
  public update(world: World): void {
    for (const plugin of this.plugins) {
      plugin.update(world);
    }

    // Renders everything to the view.
    this.stage.layers.update();
    this.renderer.update();

    // Clear all debug information immediately after drawing so that the next frame
    // can draw new ones.
    this.renderer.debugDraw.clear();
  }

}
