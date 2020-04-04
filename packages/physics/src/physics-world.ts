import { b2World, b2Vec2 } from "@flyover/box2d";
import { Injectable, Optional } from "@tiles/injector";
import { Ticker, Vec2 } from "@tiles/engine";
import { Entity } from "@tiles/entity-system";
import { b2Body } from "@flyover/box2d/Box2D/Box2D";

@Injectable()
export class PhysicsWorld {

  /** Contains the Box2D world. */
  public readonly b2world: b2World;

  /** Contains Box2D bodies mapped to the game entity to which they belong. */
  protected readonly bodies = new Map<Entity, b2Body>();

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
   * @param ticker {@link Ticker}
   * @param gravity (optional) The world gravity vector.
   * @param doSleep (optional) Improvie performance by not simulating inactive bodies.
   */
  constructor(
    protected readonly ticker: Ticker,
    @Optional('gravity') gravity: Vec2 = [0, 0],
    @Optional('doSleep') doSleep = false
  ) {
    // noinspection JSPotentiallyInvalidConstructorUsage
    this.b2world = new b2World(new b2Vec2(
      gravity[0],
      gravity[1]
    ));
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
