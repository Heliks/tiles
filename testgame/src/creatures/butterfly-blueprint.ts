import { Circle, EntityBuilder } from '@heliks/tiles-engine';
import { Blueprint } from '../modules/spawner';
import { CollisionGroups, MaterialType } from '../const';
import { VISION_COLLIDER_TYPE } from '../vision';
import { Health } from '../components';
import { Movement } from '../movement-system';
import { RigidBody } from '@heliks/tiles-physics';
import { Behavior } from '../modules/behavior';
import { TortoiseBlackboard } from './tortoise-behavior';
import { CritterBehavior, CritterBlackboard } from './critter-behavior';

export class ButterflyBlueprint extends Blueprint {

  constructor() {
    super('creatures/butterfly.json');
  }

  /** @inheritDoc */
  public create(entity: EntityBuilder): void {
    const body = RigidBody.dynamic()
      .attach(new Circle(0.2), {
        material: MaterialType.ORGANIC
      })
      .attach(new Circle(2), {
        sensor: true,
        type: VISION_COLLIDER_TYPE
      });

    body.group = CollisionGroups.Enemy;

    entity
      .use(new Health(20))
      .use(new Movement(0.2))
      .use(new Behavior('critter', new CritterBlackboard()))
      .use(body)
      .build();
  }

}
