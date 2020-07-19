import { Inject, Injectable } from '@tiles/injector';
import { RendererPlugin } from '@tiles/pixi';
import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';
import { Renderer } from '@tiles/pixi';

/**
 * A `RendererPlugin` that can be used to draw rigid body debug information to the
 * renderers debug draw layer.
 */
@Injectable()
export class PhysicsDebugDraw implements RendererPlugin {

  /**
   * @param adapter The physics adapter.
   * @param renderer [[Renderer]]
   */
  constructor(
    @Inject(ADAPTER_TK)
    private readonly adapter: PhysicsAdapter,
    private readonly renderer: Renderer
  ) {
    adapter.setupDebugDraw(renderer);
  }

  /** Updates the debug draw. Should be called once on each frame. */
  public update(): void {
    this.adapter.drawDebugData();
  }

}
