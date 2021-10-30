import { Injectable } from '@heliks/tiles-engine';
import { RendererPlugin } from '@heliks/tiles-pixi';
import { Physics } from './physics';


/**
 * A `RendererPlugin` that can be used to draw rigid body debug information to the
 * renderers debug draw layer.
 */
@Injectable()
export class PhysicsDebugDraw implements RendererPlugin {

  /**
   * @param physics The physics adapter.
   */
  constructor(private readonly physics: Physics) {}

  /** Updates the debug draw. Should be called once on each frame. */
  public update(): void {
    this.physics.drawDebugData();
  }

}
