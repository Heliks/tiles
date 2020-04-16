import { b2DrawFlags } from "@flyover/box2d";
import { DebugDrawBox2dAdapter } from "./debug-draw-box2d-adapter";
import { Inject, Injectable } from "@tiles/injector";
import { PhysicsWorld } from "./world";
import { PhysicsConfig, TK_PHYSICS_CONFIG } from "./config";
import { Renderer } from '@tiles/pixi';

/**
 * Flags that can be used to enable the drawing of different
 * debugging information.
 */
export enum DebugDrawFlag {
  // Enables the drawing of shape outlines.
  Shapes = b2DrawFlags.e_shapeBit,
  // Enables the drawing of particles.
  Particles = b2DrawFlags.e_particleBit,
  // Enables the drawing of joint connections.
  Joints = b2DrawFlags.e_jointBit,
  // Enables the drawing of AABB (Axis aligned bounding boxes).
  Aabb = b2DrawFlags.e_aabbBit,
  // Draw center of mass.
  CenterOfMass = b2DrawFlags.e_centerOfMassBit
}

@Injectable()
export class DebugDraw {

  /** Box2D debug draw adapter. */
  protected adapter: DebugDrawBox2dAdapter;

  /**
   * @param world [[PhysicsWorld]]
   * @param config [[PhysicsConfig]]
   * @param renderer [[Renderer]]
   */
  constructor(
    protected readonly world: PhysicsWorld,
    @Inject(TK_PHYSICS_CONFIG)
    config: PhysicsConfig,
    renderer: Renderer
  ) {
    this.adapter = new DebugDrawBox2dAdapter(renderer.debugDraw, config.unitSize);

    // Register the box2d adapter for debug draw callbacks.
    world.bWorld.SetDebugDraw(this.adapter);
  }

  /**
   * Sets draw flags, instructing the debug draw to draw or ignore
   * certain information.
   *
   * ```ts
   * // Draw all shapes and particles.
   * debugDraw.setDrawFlags(
   *    DebugDrawFlag.Shapes,
   *    DebugDrawFlag.Particles
   * );
   * ```
   */
  public setDrawFlags(...flags: DebugDrawFlag[]): this {
    let mask = 0;

    for (const flag of flags) {
      mask |= flag;
    }

    this.adapter.SetFlags(mask);

    return this;
  }

  /** Returns the draw flag bitmask. */
  public getDrawFlags(): number {
    return this.adapter.GetFlags();
  }

  /** Updates the debug draw. Should be called once on each frame. */
  public update(): void {
    this.world.bWorld.DrawDebugData();
  }

}
