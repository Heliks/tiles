import { PhysicsWorld } from "./physics-world";
import { Entity, Query, System } from "@tiles/entity-system";
import { ProcessingSystem, Transform, Vec2, World } from "@tiles/engine";
import { BodyPart, BodyPartData, BodyPartType, RigidBody, RigidBodyType } from "./rigid-body";
import { Injectable } from "@tiles/injector";
import { b2BodyType, b2BodyDef, b2FixtureDef, b2PolygonShape, b2World, b2Body } from "@flyover/box2d";

/** Parses the given body `part` anda adds the data to the box2d fixture `def`. */
export function parseBodyPart(part: BodyPart, def: b2FixtureDef): void {
  const data = {
    density: 1,
    friction: 1,
    position: [0, 0],
    ...part
  };

  def.density = data.density;
  def.friction = data.friction;

  // Todo: Other shapes.
  def.shape = new b2PolygonShape();

  // convert polygon to a box. The type hint here is some-how inferred incorrectly
  (def.shape as any).SetAsBox(
    data.data[0] / 2,
    data.data[1] / 2
  );
}

export function createBody(world: b2World, comp: RigidBody, position: Vec2) {
  const bodyDef = new b2BodyDef();

  // If true the body won't be allowed to rotate. This will be the
  // case in most tiling games a.E.
  bodyDef.fixedRotation = true;

  // The bodies initial position.
  bodyDef.position.Set(position[0], position[0]);

  // assign body type
  switch (comp.type) {
    case RigidBodyType.Dynamic:
      bodyDef.type = b2BodyType.b2_dynamicBody;
      break;
    case RigidBodyType.Kinetic:
      bodyDef.type = b2BodyType.b2_kinematicBody;
      break;
    default:
    case RigidBodyType.Static:
      bodyDef.type = b2BodyType.b2_staticBody;
      break;
  }

  // Create the Box2D body.
  const body = world.CreateBody(bodyDef);

  // Create all body parts.
  const partDef = new b2FixtureDef();

  for (const part of comp.bodyParts) {
    parseBodyPart(part, partDef);
    body.CreateFixture(partDef);
  }

  return body;
}

@Injectable()
export class PhysicsSystem extends ProcessingSystem {

  protected bodies = new Map<Entity, b2Body>();

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
      const body  = $body.get(entity);
      const trans = $trans.get(entity);

      let b2Body = this.bodies.get(entity);

      if (body.dirty) {
        body.dirty = false;

        if (b2Body) {
          // Rebuild
          throw new Error('Rebuild not implemented.');
        }
        else {
          b2Body = createBody(this.world.b2world, body, [
            trans.x,
            trans.y
          ]);

          // Assign this body to the entity.
          this.bodies.set(entity, b2Body);
        }
      }

      if (b2Body) {
        const velocity = b2Body.GetLinearVelocity();

        body.velocity[0] = velocity.x;
        body.velocity[1] = velocity.y;
      }
    }

    this.world.update();
  }

}