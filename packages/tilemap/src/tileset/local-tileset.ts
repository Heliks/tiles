import { Tileset } from './tileset';


/** Maps a {@link Tileset tileset} to a global ID range. */
export class LocalTileset<T extends Tileset = Tileset> {

  /** Contains the highest ID in the occupied ID range. */
  public get lastId(): number {
    return this.firstId + this.tileset.size - 1;
  }

  /**
   * @param tileset Tileset that is mapped to the ID range.
   * @param firstId Lowest possible ID in the occupied ID range.
   */
  constructor(public readonly tileset: T, public readonly firstId: number) {}

  /** Converts a local tile ID to a global one. */
  public getGlobalId(localId: number): number {
    return this.firstId + localId - 1;
  }

  /** Converts a global tile ID to a local tile index. */
  public getLocalIndex(globalId: number): number {
    return globalId - this.firstId;
  }

  /** Converts a global tile ID to a local one. */
  public getLocalId(globalId: number): number {
    return globalId - this.firstId + 1;
  }

  /** Returns `true` if this local tileset is the owner a global tile id `id`. */
  public checkId(id: number): boolean {
    return Boolean(id >= this.firstId && id <= this.lastId);
  }

  /** Creates a clone of this tileset. */
  public clone(): LocalTileset<T> {
    return new LocalTileset(this.tileset, this.firstId);
  }

}


