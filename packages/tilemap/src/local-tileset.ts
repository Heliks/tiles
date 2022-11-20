import { Tileset } from './tileset';


/**
 * Maps a tileset to a global ID range.
 *
 * @see Tileset
 */
export class LocalTileset {

  /** Contains the highest ID in the occupied ID range. */
  public get lastId(): number {
    return this.firstId + this.tileset.size - 1;
  }

  /**
   * @param tileset Tileset that is mapped to the ID range.
   * @param firstId Lowest possible ID in the occupied ID range.
   */
  constructor(
    public readonly tileset: Tileset,
    public readonly firstId: number
  ) {}

  /** Converts a local tile ID to a global one. */
  public getGlobalId(id: number): number {
    return this.firstId + id - 1;
  }

  /** Converts a global tile ID to a local tile index. */
  public getLocalIndex(id: number): number {
    return id - this.firstId;
  }

  /** Converts a global tile ID to a local one. */
  public getLocalId(id: number): number {
    return id - this.firstId + 1;
  }

  /** Returns `true` if this local tileset is the owner a global tile id `id`. */
  public checkId(id: number): boolean {
    return Boolean(id >= this.firstId && id <= this.lastId);
  }

}


