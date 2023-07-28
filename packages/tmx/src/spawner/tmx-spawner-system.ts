import { TmxSpawner } from './tmx-spawner';
import { ProcessingSystem, QueryBuilder, Query, World, Transform, InjectStorage } from '@heliks/tiles-engine';
import { AssetStorage } from '@heliks/tiles-assets';
import { Injectable, Storage } from '@heliks/tiles-engine';
import { TmxSpawnMap } from './tmx-spawn-map';


@Injectable()
export class TmxSpawnerSystem extends ProcessingSystem {

  constructor(
    private readonly assets: AssetStorage,
    @InjectStorage(TmxSpawnMap)
    private readonly spawners: Storage<TmxSpawnMap>,
    private readonly spawner: TmxSpawner,
    @InjectStorage(Transform)
    private readonly transforms: Storage<Transform>
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(TmxSpawnMap)
      .contains(Transform)
      .build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const spawner = this.spawners.get(entity);

      if (spawner.handle) {
        const map = this.assets.get(spawner.handle)?.data;

        // Map is loaded.
        if (map && spawner.dirty) {
          this.spawner.spawn(world, map, entity);

          // Update is done.
          spawner.dirty = false;
        }
      }
    }
  }

}
