import { Tileset } from './tileset';
import { Grid } from '@heliks/tiles-engine';
import { TilesetBag } from './tileset-bag';
import { NodeHandle } from '@heliks/tiles-pixi';

export class Tilemap extends TilesetBag {

  /**
   * @param grid The grid that represents the boundaries of the map, and also where
   *  individual tiles are placed.
   * @param tilesets Collection of tilesets that are used for rendering the tiles.
   * @param data Tilemap data.
   */
  constructor(
    public readonly grid: Grid,
    public readonly tilesets: Tileset[],
    public readonly data: number[],
    public readonly node?: NodeHandle
  ) {
    super();
  }

}
