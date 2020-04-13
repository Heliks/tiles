import { PhysicsWorld } from "./world";
import { Entity, Query } from "@tiles/entity-system";
import { ProcessingSystem, Transform, Vec2, World } from "@tiles/engine";
import { BodyPart, RigidBody, RigidBodyType } from "./rigid-body";
import { Injectable } from "@tiles/injector";
import { b2Body, b2BodyDef, b2BodyType, b2FixtureDef, b2PolygonShape, b2Vec2, b2World } from "@flyover/box2d";

/** Parses the given body `part` anda adds the data to the box2d fixture `def`. */
export function parseBodyPart(part: BodyPart, def: b2FixtureDef, restitution: number, group: number, mask: number): void {
  const data = {
    density: 1,
    friction: 0.5,
    position: [0, 0],
    ...part
  };

  def.density = data.density;
  def.friction = data.friction;
  def.restitution = restitution;

  def.filter.categoryBits = group;
  def.filter.maskBits = mask;

  // Todo: Other shapes.
  def.shape = new b2PolygonShape();

  // convert polygon to a box. The type hint here is somehow inferred incorrectly
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
  bodyDef.position.Set(position[0], position[1]);

  // Set initial velocity.
  bodyDef.linearVelocity.Set(
    comp.velocity[0],
    comp.velocity[1]
  );

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

  // Enables continuous collision detection on the body which prevents
  // small fixtures (like bullets) from passing through thin fixtures.
  if (comp.isBullet) {
    body.SetBullet(true);
  }

  // Create all body parts.
  const partDef = new b2FixtureDef();

  for (const part of comp.bodyParts) {
    parseBodyPart(
      part,
      partDef,
      comp.restitution,
      comp.group,
      comp.mask
    );

    body.CreateFixture(partDef);
  }

  body.SetLinearDamping(comp.damping);

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

          // Assign the entity to which the body belongs as user data
          // to the box2d body so that we can backtrack it later on.
          b2Body.SetUserData(entity);

          // Assign this body to the entity.
          this.bodies.set(entity, b2Body);
        }
      }

      if (b2Body) {
        if (body.velocityTransform) {
          b2Body.SetLinearVelocity(new b2Vec2(
            body.velocityTransform[0],
            body.velocityTransform[1]
          ));

          body.velocityTransform = undefined;
        }

        const velocity = b2Body.GetLinearVelocity();
        const position = b2Body.GetPosition();

        body.velocity[0] = velocity.x;
        body.velocity[1] = velocity.y;

        // Update values on trans component.
        trans.setPosition(position.x, position.y);
      }
    }

    this.world.update();
  }

}
