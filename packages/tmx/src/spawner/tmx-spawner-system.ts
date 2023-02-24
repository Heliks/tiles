import { TmxSpawner } from './tmx-spawner';
import { ProcessingSystem, QueryBuilder, Query, World } from '@heliks/tiles-engine';
import { AssetStorage } from '@heliks/tiles-assets';
import { Injectable } from '@heliks/tiles-engine';
import { TmxSpawnMap } from './tmx-spawn-map';


@Injectable()
export class TmxSpawnerSystem extends ProcessingSystem {

  constructor(
    private readonly assets: AssetStorage,
    private readonly spawner: TmxSpawner
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(TmxSpawnMap).build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const storage = world.storage(TmxSpawnMap);

    for (const entity of this.query.entities) {
      const component = storage.get(entity);

      if (component.dirty && component.handle) {
        const map = this.assets.get(component.handle)?.data;

        if (map) {
          this.spawner.spawn(world, map, entity);

          // Update is done.
          component.dirty = false;
        }
      }
    }
  }

}
