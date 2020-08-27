import { Transform, World } from '@heliks/tiles-engine';
import { Handle } from '@heliks/tiles-assets';
import { SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Health } from '../components/health';
import { Inventory, Item } from '../components/inventory';
import { BodyPartType, RigidBody } from '@heliks/tiles-physics';

/** Spawns a josh into the world. */
export function spawnJosh(world: World, sheet: Handle<SpriteSheet>, x: number, y: number): void {
  const inventory = new Inventory();

  inventory.add({
    id: 1,
    spritesheet: 'objects/vegetables.json',
    sprite: 0,
    name: 'item.cabbage'
  });

  const body = new RigidBody().attach({
    data: [0.4, 0.4],
    density: 1,
    type: BodyPartType.Rect
  });

  world
    .builder()
    .use(new Transform(x, y))
    .use(new Health(15, 15))
    .use(new SpriteDisplay(sheet, 0, 1))
    .use(body)
    .use(inventory)
    .build();
}
