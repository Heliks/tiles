import { Grid } from '@heliks/tiles-engine';
import { Layer } from './layers';
import { Properties } from './properties';
import { Tileset } from './tileset';


export class Tilemap<P extends Properties = Properties> {

  public readonly tilesets: Tileset[] = [];
  public readonly layers: Layer[] = [];

  /**
   * @param grid
   * @param chunkLayout Grid that arranges map chunks. Columns and rows determine amount
   *  of chunks in each direction, cell size determines amount of tiles in each chunk.
   * @param properties Custom properties.
   */
  constructor(
    public readonly grid: Grid,
    public readonly chunkLayout: Grid,
    public readonly properties: P
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

  /** Converts a global tile `id` to a local one. */
  public toLocalId(id: number): number {
    return this.tileset(id).toLocal(id);
  }

}
