import { System } from "@tiles/entity-system";
import { World } from "@tiles/engine";
import { Injectable } from "@tiles/injector";
import { PhysicsWorld } from "./physics-world";

@Injectable()
export class PhysicsDebugDrawSystem implements System {

  constructor(
    protected readonly world: PhysicsWorld
  ) {

  }

  public update(world: World): void {

  }


}