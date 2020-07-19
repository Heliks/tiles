import { Tileset } from './tileset';
import { Grid } from '@tiles/engine';
import { Layer } from './layers/layer';

export class TilesetItem {

  /**
   * Contains the last ID in the global ID range that the [[tileset]] of this item
   * is occupying.
   */
  public get lastId(): number {
    return this.firstId + this.tileset.size - 1;
  }

  /**
   * @param tileset A tileset.
   * @param firstId The start of the global ID range that the local ids of [[tileset]]
   *  are occupying.
   */
  constructor(
    public readonly tileset: Tileset,
    public readonly firstId: number
  ) {}

  /**
   * Converts `id` to its local counterpart on [[tileset]]. For example if [[firstId]]
   * is `12` this function will return the local ID `3` when given a global ID of `15`.
   */
  public toLocal(id: number): number {
    return id - this.firstId + 1;
  }

}

export class Tilemap extends Grid {

  constructor(
    cols: number,
    rows: number,
    tileWidth: number,
    tileHeight: number,
    public readonly layers: Layer<Tilemap>[] = [],
    public readonly tilesets: TilesetItem[] = []
  ) {
    super(cols, rows, tileWidth, tileHeight)
  }

  /**
   * Returns the `TilesetItem` that has a `firstId` greater or equal, and a lastId
   * smaller or equal to the given tile `id`. Throws an error if none could be found.
   */
  public tileset(id: number): TilesetItem {
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

