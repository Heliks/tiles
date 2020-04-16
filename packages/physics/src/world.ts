import { b2Contact, b2ContactListener, b2Vec2, b2World } from "@flyover/box2d";
import { Injectable, Optional } from "@tiles/injector";
import { containsAll, EventQueue, Ticker, Vec2, World } from "@tiles/engine";
import { Entity, Storage } from "@tiles/entity-system";
import { RigidBody } from "./rigid-body";

export enum ContactEventType {
  /** Two body parts started colliding. */
  Begin,
  /** Two previously colliding body parts lost contact. */
  End
}

export interface ContactEvent {
  /** The entity that triggered the contact event. */
  entityA: Entity;
  /** The entity with which [[entityA]] collided. */
  entityB: Entity;
  /** The `RigidBody` that belongs to [[entityA]]. */
  bodyA: RigidBody;
  /** The `RigidBody` that belongs to [[entityB]]. */
  bodyB: RigidBody;
  /** Event type. */
  type: ContactEventType;
}

export interface QueueItem {
  queue: EventQueue<ContactEvent>;
  tags: string[];
}

/** Listens to Box2D contact events and forwards them to an `EventQueue`. */
class ContactListener extends b2ContactListener {

  protected readonly queues: QueueItem[] = [];

  protected readonly bodies: Storage<RigidBody>;

  constructor(protected readonly world: World) {
    super();

    this.bodies = world.storage(RigidBody);
  }

  public queue(tags: string[] = []): EventQueue<ContactEvent> {


    const queue = new EventQueue<ContactEvent>();

    this.queues.push({
      queue,
      tags
    });

    return queue;
  }

  /** Sends the event `type` to all registered event queues. */
  private send(entityA: Entity, entityB: Entity, type: ContactEventType): void {
    const bodyA = this.bodies.get(entityA);
    const bodyB = this.bodies.get(entityB);

    for (const item of this.queues) {
      // Handle events for bodyA
      if (containsAll(bodyA.tags, item.tags)) {
        item.queue.push({
          bodyA, bodyB, entityA, entityB, type
        });
      }

      // Handle events for bodyB
      if (containsAll(bodyB.tags, item.tags)) {
        item.queue.push({
          bodyA: bodyB,
          bodyB: bodyA,
          entityA: entityB,
          entityB: entityA,
          type
        });
      }
    }
  }

  /** Called by Box2D every time a fixture contact with another fixture. */
  public BeginContact(contact: b2Contact): void {
    const entityA = contact.GetFixtureA().GetBody().GetUserData();
    const entityB = contact.GetFixtureB().GetBody().GetUserData();

    // Send events.
    this.send(entityA, entityB, ContactEventType.Begin);
  }

  /** Called by Box2D every time a fixture looses contact with another fixture. */
  public EndContact(contact: b2Contact): void {
    const entityA = contact.GetFixtureA().GetBody().GetUserData();
    const entityB = contact.GetFixtureB().GetBody().GetUserData();

    // Check if both entities are still alive since one of them might've been
    // destroyed during their initial contact.
    if (
      this.world.alive(entityA) &&
      this.world.alive(entityB)
    ) {
      // Send events.
      this.send(entityA, entityB, ContactEventType.End);
    }
  }

}

@Injectable()
export class PhysicsWorld {

  /** Contains the Box2D world. */
  public readonly bWorld: b2World;

  /**
   * How many iterations are allowed for the physics velocity calculation phase. Less
   * increases performance but makes physics less accurate.
   */
  public velocityIterations = 2;

  /**
   * How many iterations are allowed for the box2sd position calculation phase. Less
   * increases performance but makes physics less accurate.
   */
  public positionIterations = 6;

  /**
   * @param ticker [[Ticker]]
   * @param gravity (optional) The world gravity vector.
   */
  constructor(
    protected readonly ticker: Ticker,
    @Optional('gravity') gravity: Vec2 = [0, 0],
  ) {
    // noinspection JSPotentiallyInvalidConstructorUsage
    this.bWorld = new b2World(new b2Vec2(
      gravity[0],
      gravity[1]
    ));
  }

  protected contactListener?: ContactListener;

  /** {@inheritDoc} */
  public setup(world: World): void {
    this.contactListener = new ContactListener(world);

    // Forwards Box2D contact events to the contact listener.
    this.bWorld.SetContactListener(this.contactListener);
  }

  public events(tags: string[] = []): EventQueue<ContactEvent> {
    if (!this.contactListener) {
      throw new Error('Called before setup');
    }

    return this.contactListener.queue(tags);
  }

  /** Updates the physics world. */
  public update(): void {
    this.bWorld.Step(
      this.ticker.getDeltaSeconds(),
      this.velocityIterations,
      this.positionIterations
    );
  }

}
