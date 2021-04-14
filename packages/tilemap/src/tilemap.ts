import { Tileset } from './tileset';
import { Grid } from '@heliks/tiles-engine';
import { TilesetBag } from './tileset-bag';

export class Tilemap extends TilesetBag {

  /**
   * @param grid The grid that represents the boundaries of the map, and also where
   *  individual tiles are placed.
   * @param tilesets Collection of tilesets that are used for rendering the tiles.
   * @param data Tilemap data.
   * @param layer (optional) Index of the layer where this sprite should be placed.
   */
  constructor(
    public readonly grid: Grid,
    public readonly tilesets: Tileset[],
    public readonly data: number[],
    public readonly layer = 0
  ) {
    super();
  }

}
