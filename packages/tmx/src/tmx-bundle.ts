import { AssetLoader } from '@heliks/tiles-assets';
import { AppBuilder, Bundle, World } from '@heliks/tiles-engine';
import { TmxLoadTilemap, TmxLoadTileset } from './formats';


/** @internal */
function setupAssetFormats(world: World): void {
  world
    .get(AssetLoader)
    .use(new TmxLoadTileset())
    .use(new TmxLoadTilemap());
}

/**
 * Provides asset loader formats to parse TMX files.
 *
 * ## Normalization
 *
 * ### Shapes
 *
 * The position of shapes (a.E. Tiled Collision Editor shapes, Shape objects, etc.) will
 * be converted to be center aligned. This makes it easier to re-use these shapes for
 * the physics engine.
 *
 * ### Ellipses
 *
 * The physics engine doesn't support elliptic shapes, hence why they will be converted
 * to circles. The radius of the circle is the larger of the two sides of the ellipsis.
 */
export class TmxBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder.run(setupAssetFormats);
  }

}
