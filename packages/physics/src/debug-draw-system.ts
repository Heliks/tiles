import { System } from "@tiles/entity-system";
import { World } from "@tiles/engine";
import { Injectable } from "@tiles/injector";
import { DebugDraw } from "./debug-draw";

@Injectable()
export class DebugDrawSystem implements System {

  constructor(protected readonly debugDraw: DebugDraw) {}

  /** {@inheritDoc} */
  public update(world: World): void {
    this.debugDraw.update();
  }

}