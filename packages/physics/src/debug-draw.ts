import { b2DrawFlags } from "@flyover/box2d";
import { DebugDrawBox2dAdapter } from "./debug-draw-box2d-adapter";
import { Inject, Injectable } from "@tiles/injector";
import { PhysicsWorld } from "./world";
import { PhysicsConfig, TK_PHYSICS_CONFIG } from "./config";
import { Renderer } from '@tiles/pixi';
import { Subscriber } from "@tiles/engine";

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

  /** Subscriber that listens to renderer resize events. */
  protected onRendererResize$: Subscriber;

  /**
   * @param config [[PhysicsConfig]]
   * @param world [[PhysicsWorld]]
   * @param renderer [[Renderer]]
   */
  constructor(
    @Inject(TK_PHYSICS_CONFIG) config: PhysicsConfig,
    protected readonly world: PhysicsWorld,
    protected readonly renderer: Renderer,
  ) {
    this.adapter = new DebugDrawBox2dAdapter(config.unitSize);

    // Add the DebugDraw to the renderers debug draw.
    renderer.debugDraw.addChild(this.adapter.view);

    // Register the box2d adapter for debug draw callbacks.
    world.bWorld.SetDebugDraw(this.adapter);

    // Subscribe to resize events.
    this.onRendererResize$ = renderer.onResize.subscribe();
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
    for (const event of this.renderer.events.read(this.onRendererResize$)) {
      // Resize the debug draw according to new renderer dimensions.
      this.adapter.resize(event.width, event.height, event.ratio);
    }

    // Update the debug draw.
    this.adapter.update(this.world.bWorld);
  }

}
