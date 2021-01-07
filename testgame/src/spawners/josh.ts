import { Handle } from '@heliks/tiles-assets';
import { Entity, Parent, Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { SpriteAnimation, SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Health, Inventory } from '../components';
import { Circle } from '@heliks/tiles-math';
import { CollisionGroups, MaterialType } from '../const';
import { Behavior, MonoBehavior } from '../behavior';
import { Movement } from '../movement-system';
import { TortoiseBlackboard } from '../behaviors/tortoise-behavior';
import { VISION_COLLIDER_TYPE } from '../vision';

export const FACTION_ID_CARNIVORE = 'WL_CARNIVORE';
export const FACTION_ID_HERBIVORE = 'WL_HERBIVORE';

/** Spawns a josh into the world. */
export function spawnJosh(
  world: World,
  sheet: Handle<SpriteSheet>,
  x: number,
  y: number,
  parent: Entity
): void {
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

  world
    .builder()
    .use(new Transform(x, y))
    .use(new Health(200, 200))
    .use(new SpriteDisplay(sheet, 0))
    .use(new SpriteAnimation().play('idle'))
    .use(new Behavior('tortoise', new TortoiseBlackboard()))
    .use(new Movement(0.2))
    .use(new Parent(parent))
    .use(body)
    .use(inventory)
    .build();
}
