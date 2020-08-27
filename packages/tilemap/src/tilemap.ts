import { Tileset } from './tileset';
import { Grid } from '@heliks/tiles-engine';
import { Layer } from './layers';

export class Tilemap {

  /**
   * @param grid The grid that represents the boundaries of the map, and also where
   *  individual tiles are placed.
   * @param tilesets Collection of tilesets that are used for rendering the tiles.
   * @param layers Individual layers that make up this map.
   */
  constructor(
    public readonly grid: Grid,
    public readonly tilesets: Tileset[] = [],
    public readonly layers: Layer[] = []
  ) {}

  /**
   * Returns the `TilesetItem` that has a `firstId` greater or equal, and a lastId
   * smaller or equal to the given tile `id`. Throws an error if none could be found.
   */
  public tileset(id: number): Tileset {
    const item = this.tilesets.find(item => item.firstId <= id && item.lastId >= id);

    if (!item) {
      throw new Error(`"${id}" does not match any tilesets.`);
    }

    return item;
  }

  /** Converts a global `id` to a local one. */
  public toLocalId(id: number): number {
    return this.tileset(id).toLocal(id);
  }

}
