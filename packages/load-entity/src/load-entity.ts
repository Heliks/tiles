import { Format } from '@heliks/tiles-assets';
import { EntityData, EntitySerializer } from '@heliks/tiles-engine';
import { LoadedEntity } from './loaded-entity';


/**
 * File format to load entities from `.entity` or `.entity.json` files. The format will
 * produce a {@link LoadedEntity} that can be used to spawn entities from the loaded
 * entity data into the world.
 *
 * ```ts
 *  const app = runtime()
 *    .bundle(AssetsBundle)          // The AssetsBundle & the SerializationBundle are
 *    .bundle(SerializationBundle)   // dependencies and must be registered first.
 *    .bundle(LoadEntityBundle)
 *    .build();
 *
 *  async function load(world: World): Promise<LoadedEntity> {
 *    const loader = world.get(AssetLoader);
 *
 *    // Load the file containing entity data.
 *    const handle = await loader.async('foo.entity');
 *
 *    // Get asset from storage.
 *    return loader.assets.resolve(handle).data;
 *  }
 *
 *  load(app.world).then(entity => {
 *    entity.insert(app.world);
 *
 *    // We can insert as many copies from the loaded data as we want.
 *    entity.insert(app.world);
 *    entity.insert(app.world);
 *  });
 * ```
 */
export class LoadEntity implements Format<EntityData, LoadedEntity> {

  /** @inheritDoc */
  public readonly extensions = ['entity.json', '.entity'];

  /**
   * @param serializer Serializer used to deserialize the entity data.
   */
  constructor(public readonly serializer: EntitySerializer) {}

  /** @inheritDoc */
  public process(data: EntityData): LoadedEntity {
    return new LoadedEntity(this.serializer, data);
  }

}

