import {
  ComponentEventType,
  contains,
  Injectable,
  ProcessingSystem,
  Subscriber,
  Ticker,
  Transform,
  World
} from '@heliks/tiles-engine';
import { Spawner } from './spawner';
import { ObjectTypes } from '../world/object-types';
import { SpawnerObject } from './spawner-object';
import { SpawnerManager } from './spawner-manager';

@Injectable()
export class SpawnerSystem extends ProcessingSystem {

  /** @internal */
  private subscriber!: Subscriber;

  constructor(private readonly spawners: SpawnerManager) {
    super(contains(Spawner, Transform));
  }

  /** @inheritDoc */
  public boot(world: World): void {
    this.subscriber = world.storage(Spawner).subscribe();

    // Register the spawner as a world object type to automatically load them with
    // the map loader.
    world.get(ObjectTypes).set('spawner', new SpawnerObject());

    // Boot parent system to setup entity groups.
    super.boot(world);
  }

  /** @inheritDoc */
  public update(world: World): void {
    const spawners = world.storage(Spawner);

    // De-spawn entities of removed spawners.
    for (const event of spawners.events(this.subscriber)) {
      if (event.type === ComponentEventType.Removed) {
        if (event.component.entity) {
          world.destroy(event.component.entity);
        }
      }
    }

    for (const entity of this.group.entities) {
      const spawner = spawners.get(entity);

      if (spawner.entity) {
        if (!world.alive(spawner.entity)) {
          spawner.reset();
        }
      }
      else {
        if (spawner.cooldown <= 0) {
          const trans = world.storage(Transform).get(entity);

          // Get a spawn location within the spawners acceptable range.
          // Todo: Spawn location should be outside of the player camera if possible.
          const spawnLoc = spawner.getRandomSpawnPosition(trans);

          spawner.entity = this.spawners.spawn(
            world,
            spawner.id,
            spawnLoc.x,
            spawnLoc.y
          );
        }
        else {
          spawner.cooldown -= world.get(Ticker).delta;
        }
      }
    }
  }

}

