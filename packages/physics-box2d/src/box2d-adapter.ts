import { B2World } from '@heliks/box2d';
import { AppBuilder, EventQueue, Type, Vec2 } from '@heliks/tiles-engine';
import { PhysicsAdapter } from '@heliks/tiles-physics';
import { Box2dBodyFactory } from './box2d-body-factory';
import { Box2dRaycaster } from './box2d-raycaster';
import { Box2dWorld } from './box2d-world';
import { B2_RAYCASTS, B2_WORLD } from './const';


/* eslint-disable new-cap */
export class Box2dAdapter implements PhysicsAdapter {

  /**
   * @param gravity Gravity in which Box2D simulates the world. This affects pretty
   *  much the behavior of all physics operations, such as acceleration, speed etc.
   */
  constructor(public readonly gravity = new Vec2(0, 0)) {}

  /** @inheritDoc */
  public getPhysicsType(): Type<Box2dWorld> {
    return Box2dWorld;
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const world = new B2World(this.gravity);

    builder
      .provide(B2_RAYCASTS, new EventQueue())
      .provide(B2_WORLD, world)
      .provide(Box2dBodyFactory)
      .provide(Box2dRaycaster);
  }

}
