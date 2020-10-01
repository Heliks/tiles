import { Handle } from '@heliks/tiles-assets';
import { Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Health } from '../components/health';
import { Inventory } from '../components/inventory';
import { Rectangle } from '@heliks/tiles-math';

/** Spawns a josh into the world. */
export function spawnJosh(world: World, sheet: Handle<SpriteSheet>, x: number, y: number): void {
  const inventory = new Inventory();

  inventory.add({
    id: 1,
    spritesheet: 'objects/vegetables.json',
    sprite: 0,
    name: 'item.cabbage'
  });

  const body = new RigidBody().attach(new Rectangle(0.5, 0.5), {
    density: 20
  });

  world
    .builder()
    .use(new Transform(x, y))
    .use(new Health(15, 15))
    .use(new SpriteDisplay(sheet, 0))
    .use(body)
    .use(inventory)
    .build();
}
