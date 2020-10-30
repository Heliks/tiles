import { Handle } from '@heliks/tiles-assets';
import { Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Health, Inventory } from '../components';
import { Rectangle } from '@heliks/tiles-math';
import { CollisionGroups } from '../const';
import { Circle } from '@heliks/tiles-math';

/** Spawns a josh into the world. */
export function spawnJosh(world: World, sheet: Handle<SpriteSheet>, x: number, y: number): void {
  const inventory = new Inventory();

  inventory.add({
    id: 1,
    spritesheet: 'objects/vegetables.json',
    sprite: 0,
    name: 'item.cabbage'
  });

  const body = RigidBody.dynamic().attach(new Circle(0.2), {
    density: 20
  });

  body.damping = 10;
  body.group = CollisionGroups.Enemy;

  world
    .builder()
    .use(new Transform(x, y))
    .use(new Health(200, 200))
    .use(new SpriteDisplay(sheet, 0))
    .use(body)
    .use(inventory)
    .build();
}
