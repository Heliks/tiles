/* eslint-disable new-cap */
import { b2World } from '@flyover/box2d';
import { ClassType, GameBuilder, Vec2 } from '@heliks/tiles-engine';
import { PhysicsAdapter } from '@heliks/tiles-physics';
import { Box2dWorld } from './box2d-world';
import { B2_WORLD } from './const';


export class Box2dAdapter implements PhysicsAdapter {

  /**
   * @param gravity Gravity in which Box2D simulates the world. This affects pretty
   *  much the behavior of all physics operations, such as acceleration, speed etc.
   */
  constructor(public readonly gravity = new Vec2(0, 0)) {}

  /** @inheritDoc */
  public getPhysicsType(): ClassType<Box2dWorld> {
    return Box2dWorld;
  }

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const world = new b2World(this.gravity);

    builder.provide({
      token: B2_WORLD,
      value: world
    });
  }

}
