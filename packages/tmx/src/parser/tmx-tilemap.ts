import { Grid } from '@heliks/tiles-engine';
import { TmxProperties } from './tmx-properties';
import { LocalTilesetBag } from '@heliks/tiles-tilemap';
import { TmxTileset } from './tmx-tileset';
import { Layer } from './layers';


/**
 * A TMX Tilemap.
 *
 * @see TmxLoadTilemap
 */
export class TmxTilemap<P extends TmxProperties = TmxProperties> {

  /** Map layers. The index of each layer is simultaneously its z position. */
  public readonly layers: Layer[] = [];

  /** Bag that contains all tilesets that are part of this map. */
  public readonly tilesets = new LocalTilesetBag<TmxTileset>()

  /**
   * @param grid Grid that represents the dimensions of the tilemap in pixels.
   * @param chunkLayout Grid on which the chunks of this map are arranged.
   *
   * Grid that arranges map chunks. Columns and rows determine amount
   *  of chunks in each direction, cell size determines amount of tiles in each chunk.
   * @param properties Custom properties.
   */
  constructor(
    public readonly grid: Grid,
    public readonly chunkLayout: Grid,
    public readonly properties: P,
  ) {}

}
