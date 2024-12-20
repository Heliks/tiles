import { Grid } from '@heliks/tiles-engine';
import { LocalTilesetBag } from '@heliks/tiles-tilemap';
import { TmxLayer } from './layers';
import { TmxTileset } from './tmx-tileset';


/**
 * Map asset created from {@link TmxMapData} when a map file is loaded.
 *
 * - `P`: Custom properties.
 * - `L`: Type of layer found on this asset.
 * - `T`: Type of tileset found on this asset.
 */
export class TmxMapAsset<P = unknown, L extends TmxLayer = TmxLayer, T extends TmxTileset = TmxTileset> {

  /** Map layers. The index of each layer is simultaneously its z position. */
  public readonly layers: L[] = [];

  /** Bag that contains all tilesets that are part of this map. */
  public readonly tilesets = new LocalTilesetBag<T>();

  /**
   * @param file Path from which the file was loaded.
   * @param grid Grid that represents the dimensions of the tilemap in pixels.
   * @param chunkLayout Grid that arranges map chunks. Columns and rows determine amount
   *  of chunks in each direction, cell size determines amount of tiles in each chunk.
   * @param properties Custom properties.
   */
  constructor(
    public readonly file: string,
    public readonly grid: Grid,
    public readonly chunkLayout: Grid,
    public readonly properties: P
  ) {}

}
