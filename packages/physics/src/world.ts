import { b2Contact, b2ContactListener, b2Vec2, b2World } from "@flyover/box2d";
import { Injectable, Optional } from "@tiles/injector";
import { EventQueue, Ticker, Vec2 } from "@tiles/engine";
import { Entity } from "@tiles/entity-system";

export enum ContactEventType {
  /** Two body parts started colliding. */
  Begin,
  /** Two previously colliding body parts lost contact. */
  End
}

export interface ContactEvent {
  /** One of the two entities in the contact event. */
  entityA: Entity;
  /** One of the two entities in the contact event. */
  entityB: Entity;
  /** Event type. */
  type: ContactEventType;
}

/** Listens to Box2D contact events and forwards them to an `EventQueue`. */
class ContactListener extends b2ContactListener {

  /**
   * @param events The event queue to which the contact events should be pushed.
   */
  constructor(protected readonly events: EventQueue<ContactEvent>) {
    super();

    // Overwrite overloaded methods.
    this.BeginContact = this.onBeginContact;
    this.EndContact = this.onEndContact;
  }

  /** Called every time a fixture contact with another fixture. */
  public onBeginContact(contact: b2Contact): void {
    this.events.send({
      entityA: contact.GetFixtureA().GetBody().GetUserData(),
      entityB: contact.GetFixtureB().GetBody().GetUserData(),
      type: ContactEventType.Begin
    });
  }

  /** Called every time a fixture looses contact with another fixture. */
  public onEndContact(contact: b2Contact): void {
    this.events.send({
      entityA: contact.GetFixtureA().GetBody().GetUserData(),
      entityB: contact.GetFixtureB().GetBody().GetUserData(),
      type: ContactEventType.End
    });
  }

}

@Injectable()
export class PhysicsWorld {

  /** Contains the Box2D world. */
  public readonly b2world: b2World;

  /** Event queue for physics events, such as when two bodies are colliding or loose contact. */
  public readonly events = new EventQueue<ContactEvent>();

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
    this.b2world = new b2World(new b2Vec2(
      gravity[0],
      gravity[1]
    ));

    // Listen to collision events.
    this.b2world.SetContactListener(new ContactListener(this.events));
  }

  /** Updates the physics world. */
  public update(): void {
    this.b2world.Step(
      this.ticker.getDeltaSeconds(),
      this.velocityIterations,
      this.positionIterations
    );
  }

}
