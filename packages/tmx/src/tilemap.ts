import { Grid } from '@heliks/tiles-engine';
import { Layer } from './layers';
import { Tileset } from '@heliks/tiles-tilemap';

export class Tilemap {

  public readonly tilesets: Tileset[] = [];
  public readonly layers: Layer[] = [];

  constructor(public readonly grid: Grid) {}

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
