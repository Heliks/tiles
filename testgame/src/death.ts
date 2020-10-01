import { AssetLoader } from '@heliks/tiles-assets';
import {
  contains,
  Entity,
  EventQueue,
  GameBuilder,
  Injectable,
  Module,
  ProcessingSystem,
  Subscriber,
  System,
  Transform,
  World
} from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { SPRITE_SHEET_STORAGE, SpriteDisplay, SpriteSheetFormat } from '@heliks/tiles-pixi';
import { Health } from './components/health';
import { Inventory, Item } from './components/inventory';
import { Rectangle } from '@heliks/tiles-math';

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

/** The event queue where events about the death of an entity are reported. */
export class DeathEvents extends EventQueue<{ entity: Entity, health: Health }> {}

/**
 * Handles death.
 */
@Injectable()
export class DeathSystem extends ProcessingSystem {

  constructor(private readonly events: DeathEvents) {
    super(contains(Health, Transform));
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
            dropItem(world, item, trans.world[0], trans.world[1]);
          }
        }

        this.events.push({
          entity,
          health
        });

        world.destroy(entity);
      }
    }
  }

}

/** Reports the death of an entity to the console. */
@Injectable()
export class DebugDeathReporter implements System {

  /** @internal */
  private readonly subscriber: Subscriber;

  constructor(private readonly events: DeathEvents) {
    this.subscriber = events.subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const { entity, health } of this.events.read(this.subscriber)) {
      console.groupCollapsed(`Death Report: Entity ${entity}`);

      for (const item of health.history) {
        console.log(`${item.source} inflicted ${item.diff()} damage. ${item.valueOld} -> ${item.valueNew}`);
      }

      console.groupEnd();
    }
  }

}

/** Death bundle to add as a module to the engine. */
export class DeathBundle implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide(DeathEvents)
      .system(DeathSystem);
  }

}
