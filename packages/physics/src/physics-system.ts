import { PhysicsWorld } from "./physics-world";
import { Query, System } from "@tiles/entity-system";
import { ProcessingSystem, Transform, World } from "@tiles/engine";
import { RigidBody } from "./rigid-body";
import { Injectable } from "@tiles/injector";

@Injectable()
export class PhysicsSystem extends ProcessingSystem {

  constructor(protected readonly world: PhysicsWorld) {
    super();
  }

  public getQuery(): Query {
    return {
      contains: [
        RigidBody,
        Transform
      ]
    };
  }

  public update(world: World): void {
    const $body = world.storage(RigidBody);
    const $trans = world.storage(Transform);

    for (const entity of this.group.entities) {
      const body = $body.get(entity);

      if (body.dirty) {
        body.dirty = false;

        console.log(body);
      }
    }


    this.world.update();
  }

}