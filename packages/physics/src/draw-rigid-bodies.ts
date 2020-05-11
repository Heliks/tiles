import { b2DrawFlags } from "@flyover/box2d";
import { DrawRigidBodiesBox2d } from "./draw-rigid-bodies-box2d";
import { Inject, Injectable } from "@tiles/injector";
import { PhysicsWorld } from "./world";
import { PhysicsConfig, TK_PHYSICS_CONFIG } from "./config";
import { Renderer, RendererPlugin } from '@tiles/pixi';

@Injectable()
export class DrawRigidBodies implements RendererPlugin {

  /** Box2D debug draw adapter. */
  protected adapter: DrawRigidBodiesBox2d;

  /**
   * @param config Configuration for physics module.
   * @param world [[PhysicsWorld]]
   * @param renderer [[Renderer]]
   */
  constructor(
    @Inject(TK_PHYSICS_CONFIG)
    protected readonly config: PhysicsConfig,
    protected readonly renderer: Renderer,
    protected readonly world: PhysicsWorld
  ) {
    this.adapter = new DrawRigidBodiesBox2d(renderer.debugDraw.ctx, config.unitSize);

    // Enable all relevant draw flags.
    this.adapter.SetFlags(
      b2DrawFlags.e_jointBit | b2DrawFlags.e_shapeBit
    );

    // Register the box2d adapter for debug draw callbacks.
    world.bWorld.SetDebugDraw(this.adapter);
  }

  /** Updates the debug draw. Should be called once on each frame. */
  public update(): void {
    // Update the debug draw.
    this.adapter.update(this.world.bWorld);
  }

}
