import { GameBuilder, Module } from "@tiles/engine";
import { PhysicsWorld } from "./physics-world";
import { PhysicsSystem } from "./physics-system";
import { DebugDrawSystem } from "./debug-draw-system";
import { DebugDraw } from "./debug-draw";

export class PhysicsModule implements Module {

  constructor(public debugDraw = false) {}

  public build(builder: GameBuilder): void {
    builder
      .provide(PhysicsWorld)
      .system(PhysicsSystem);

    // Enable debug draw.
    if (this.debugDraw) {
      builder
        .provide(DebugDraw)
        .system(DebugDrawSystem);
    }
  }

}