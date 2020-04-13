import { GameBuilder, Module } from "@tiles/engine";
import { PhysicsWorld } from "./world";
import { PhysicsSystem } from "./physics-system";
import { DebugDrawSystem } from "./debug-draw-system";
import { DebugDraw } from "./debug-draw";
import { parseConfig, PhysicsConfig, TK_PHYSICS_CONFIG } from "./config";

export class PhysicsModule implements Module {

  /**
   * @param config Configuration for physics module.
   */
  constructor(public readonly config: Partial<PhysicsConfig>) {}

  /** {@inheritDoc} */
  public build(builder: GameBuilder): void {
    const config = parseConfig(this.config);

    builder
      .provide({
        token: TK_PHYSICS_CONFIG,
        value: config
      })
      .provide(PhysicsWorld)
      .system(PhysicsSystem);

    // Enable debug draw.
    if (config.debugDraw) {
      builder
        .provide(DebugDraw)
        .system(DebugDrawSystem);
    }
  }

}
