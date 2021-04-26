import { EntityBuilder } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { Health, Inventory } from '../components';
import { Circle } from '@heliks/tiles-math';
import { CollisionGroups, MaterialType } from '../const';
import { Behavior } from '../modules/behavior';
import { Movement } from '../movement-system';
import { TortoiseBlackboard } from './tortoise-behavior';
import { VISION_COLLIDER_TYPE } from '../vision';
import { Blueprint } from '../modules/spawner';

export const FACTION_ID_CARNIVORE = 'WL_CARNIVORE';
export const FACTION_ID_HERBIVORE = 'WL_HERBIVORE';

export class TortoiseBlueprint extends Blueprint {

  constructor() {
    super('creatures/josh.json');
  }

  /** @inheritDoc */
  public create(entity: EntityBuilder): void {
    const inventory = new Inventory();

    inventory.add({
      id: 1,
      spritesheet: 'objects/vegetables.json',
      sprite: 0,
      name: 'item.cabbage'
    });

    const body = RigidBody.dynamic()
      .attach(new Circle(0.2), {
        material: MaterialType.ORGANIC
      })
      .attach(new Circle(2), {
        sensor: true,
        type: VISION_COLLIDER_TYPE
      });

    body.damping = 10;
    body.group = CollisionGroups.Enemy;

    entity
      .use(new Health(200, 200))
      .use(new Behavior('tortoise', new TortoiseBlackboard()))
      .use(new Movement(0.2))
      .use(body)
      .use(inventory)
      .build();
  }

}
