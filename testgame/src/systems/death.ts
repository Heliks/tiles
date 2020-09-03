import { AssetLoader } from '@heliks/tiles-assets';
import { EntityQuery, Injectable, ProcessingSystem, Transform, World } from '@heliks/tiles-engine';
import { Rectangle, RigidBody } from '@heliks/tiles-physics';
import { SPRITE_SHEET_STORAGE, SpriteDisplay, SpriteSheetFormat } from '@heliks/tiles-pixi';
import { Health } from '../components/health';
import { Inventory, Item } from '../components/inventory';

/** @internal */
function dropItem(world: World, item: Item, x: number, y: number) {
  const body = new RigidBody().attach(new Rectangle(0.1, 0.1), {
    density: 1
  });

  const handle = world
    .get(AssetLoader)
    .load(item.spritesheet, new SpriteSheetFormat(), world.get(SPRITE_SHEET_STORAGE));

  world
    .builder()
    .use(new SpriteDisplay(handle, item.sprite))
    .use(new Transform(x + 2, y + 2))
    .use(body)
    .build();
}

/**
 * Handles death.
 */
@Injectable()
export class DeathSystem extends ProcessingSystem {

  constructor() {
    super();
  }

  /** @inheritDoc */
  public getQuery(): EntityQuery {
    return {
      contains: [
        Health,
        Transform
      ]
    };
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _health = world.storage(Health);
    const _inventory = world.storage(Inventory);
    const _transform = world.storage(Transform);

    for (const entity of this.group.entities) {
      const health = _health.get(entity);

      // If health is below 0, destroy the entity.
      if (health.current <= 0) {
        // If the entity has an inventory we drop it for the player to pick up.
        if (_inventory.has(entity)) {
          const items = _inventory.get(entity).items;
          const trans = _transform.get(entity);

          for (const item of items) {
            console.log(`${entity} dropping ${item.id}`);

            dropItem(world, item, trans.x, trans.y);
          }
        }

        world.destroy(entity);
      }
    }
  }

}
