import { GameBuilder, Module } from "@tiles/engine";
import { PhysicsWorld } from "./physics-world";
import { PhysicsSystem } from "./physics-system";
import { PhysicsDebugDrawSystem } from "./physics-debug-draw-system";

export class PhysicsModule implements Module {

  constructor(public debugDraw = false) {}

  public build(builder: GameBuilder): void {
    builder
      .provide(PhysicsWorld)
      .system(PhysicsSystem);

    // Enable debug draw.
    if (this.debugDraw) {
      builder.system(PhysicsDebugDrawSystem);
    }
  }

}