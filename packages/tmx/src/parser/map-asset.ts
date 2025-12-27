import { Grid } from '@heliks/tiles-engine';
import { LocalTilesetBag } from '@heliks/tiles-tilemap';
import { TmxTileset } from '../level/tmx-tileset';
import { TmxLayer } from './layers';


/**
 * A loaded map asset.
 *
 * @template `P`: Custom properties.
 * @template `L`: Type of layer found on this asset.
 * @template `T`: Type of tileset found on this asset.
 */
export class MapAsset<P = unknown, L extends TmxLayer = TmxLayer, T extends TmxTileset = TmxTileset> {

  /** Contains the tilesets with which tiles, objects etc. are rendered on this map. */
  public readonly tilesets = new LocalTilesetBag<T>();

  /** @deprecated */
  public readonly layers: L[] = [];

  /**
   * @param file Path from which the file was loaded.
   * @param grid Grid that defines the dimensions of the entire tilemap. The cell size
   *  defines the size of an individual tile. Columns and rows how many tiles there are
   *  in total in each direction.
   * @param layout Grid that defines the layout of individual map chunks. Columns and
   *  rows determine the number of chunks in each direction. The cell size determines
   *  the number of tiles contained in each chunk.
   * @param properties Custom properties.
   */
  constructor(
    public readonly file: string,
    public readonly grid: Grid,
    public readonly layout: Grid,
    public readonly properties: P
  ) {}

}
