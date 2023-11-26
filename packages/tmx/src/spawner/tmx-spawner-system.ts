import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, Injectable, ProcessingSystem, Query, QueryBuilder, Transform, World } from '@heliks/tiles-engine';
import { TmxMapAsset } from '../parser';
import { TmxSpawnMap, TmxSpawnState } from './tmx-spawn-map';
import { TmxSpawner } from './tmx-spawner';


/** Renders {@link TmxMapAsset map assets} on entities with a {@link TmxSpawnMap} component. */
@Injectable()
export class TmxSpawnerSystem extends ProcessingSystem {

  /**
   * Contains all entities with {@link TmxSpawnMap} components that have just resolved
   * the promise for spawning their {@link TmxMapAsset asset}.
   *
   * On the next frame, the spawners state will be set to {@link TmxSpawnState.Spawned} and
   * the entity removed from this set. This makes sure that the state transition doesn't
   * happen in-between frames, which could lead to inconsistent states between systems.
   *
   * @internal
   */
  private spawned = new Set<Entity>();

  /**
   * @param assets {@see AssetStorage}
   * @param spawner Service used to spawn {@link TmxMapAsset assets} into the world.
   */
  constructor(private readonly assets: AssetStorage, private readonly spawner: TmxSpawner) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(TmxSpawnMap).contains(Transform).build();
  }

  /** @see TmxSpawner.spawn */
  private async spawn(world: World, asset: TmxMapAsset, entity: Entity): Promise<void> {
    await this.spawner.spawn(world, asset, entity);

    // The above async call will most likely happen in-between frames. The map state will
    // be properly updated during the next frame update.
    this.spawned.add(entity);
  }

  /** @internal */
  private processMapSpawn(world: World, asset: TmxMapAsset, spawner: TmxSpawnMap, entity: Entity): void {
    // Map has not been spawned.
    if (spawner.state === TmxSpawnState.None) {
      spawner.state = TmxSpawnState.Spawning;

      void this.spawn(world, asset, entity);
    }
    // Map has just finished spawning. Update its state.
    else if (spawner.state === TmxSpawnState.Spawning && this.spawned.has(entity)) {
      spawner.state = TmxSpawnState.Spawned;

      this.spawned.delete(entity);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    const spawners = world.storage(TmxSpawnMap);

    for (const entity of this.query.entities) {
      const spawner = spawners.get(entity);

      if (spawner.handle) {
        const asset = this.assets.get(spawner.handle);

        // Map is loaded.
        if (asset) {
          this.processMapSpawn(world, asset, spawner, entity);
        }
      }
    }
  }

}
