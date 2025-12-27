import { AssetLoader } from '@heliks/tiles-assets';
import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { TmxLoadTilemap, TmxLoadTileset } from './formats';


/**
 * Provides tools to load {@link Level levels} using the Tiled map format (TMX).
 *
 * Latest tested TMX version: 1.10.2
 *
 * ## Normalization
 *
 * ### Coordinates and sizes
 *
 * For physics, coordinates and geometric sizes can be converted into world units by
 * defining a unit size (number of pixels per meter). The default is `16`.
 *
 * To disable the unit conversation and use pixel values (not recommended), set the
 * unit size to `1`.
 *
 * ### Pivots
 *
 * By default, Tiled uses the top left corner as the pivot for geometric objects that
 * are placed on object layers. This will be converted to the geometric center.
 *
 * ### Ellipses
 *
 * Elliptic shapes will be converted into circles. This is because the physics engine
 * doesn't support them. The radius of the converted circle will be the larger side
 * of the ellipsis.
 */
export class TmxBundle implements Bundle {

  constructor(public readonly unitSize = 16) {}

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    const config = {
      unitSize: this.unitSize
    };

    builder.run(world => {
      world
        .get(AssetLoader)
        .use(new TmxLoadTileset(config))
        .use(new TmxLoadTilemap(config));
    });
  }

}
