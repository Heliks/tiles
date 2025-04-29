import { Handle } from '@heliks/tiles-assets';
import { Entity, System, Transform, World } from '@heliks/tiles-engine';
import { TmxMapAsset } from '../parser';
import { TmxSpawnMap } from './tmx-spawn-map';


/** Utility that allows the user to asynchronously load a map. */
export class TmxMapLoader<T extends TmxMapAsset = TmxMapAsset> implements System {

  /** @internal */
  private loading?: {
    /** Entity that spawned the map. */
    entity: Entity;
    /** Callback to resolve the loading promise. */
    resolve: (entity: Entity) => unknown;
  };

  /** Loads a TMX map at the given file `handle`. */
  public load(world: World, handle: Handle<T>): Promise<Entity> {
    if (this.loading !== undefined) {
      throw new Error('Only one map can be loaded at the same time.');
    }

    const entity = world
      .create()
      .use(new TmxSpawnMap(handle))
      .use(new Transform(0, 0))
      .build();

    return new Promise(resolve => {
      this.loading = {
        entity,
        resolve
      };
    })
  }

  /** @inheritDoc */
  public update(world: World): void {
    if (this.loading) {
      const spawner = world.storage(TmxSpawnMap).get(this.loading.entity);

      if (spawner.isSpawned()) {
        this.loading.resolve(this.loading.entity);
        this.loading = undefined;
      }
    }
  }

}
