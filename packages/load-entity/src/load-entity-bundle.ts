import { AssetLoader } from '@heliks/tiles-assets';
import { AppBuilder, Bundle, EntitySerializer } from '@heliks/tiles-engine';
import { LoadEntity } from './load-entity';


/**
 * Bundle that registers an asset loader format to load entities from files.
 *
 * ## Usage
 *
 * After adding the `LoadEntityBundle` to the game runtime, `.entity` and `.entity.json`
 * can be loaded by the asset loader. There is no additional setup required.
 *
 * The `SerializationBundle` and the `AssetsBundle` must be registered first.
 *
 * ```ts
 *  const app = runtime()
 *    .bundle(AssetsBundle)
 *    .bundle(SerializationBundle)
 *    .bundle(LoadEntityBundle)
 *    .build();
 * ```
 */
export class LoadEntityBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app.run(world => {
      world.get(AssetLoader).use(new LoadEntity(
          world.get(EntitySerializer)
      ))
    });
  }

}