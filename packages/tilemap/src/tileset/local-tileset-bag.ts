import { LocalTileset } from './local-tileset';
import { Tileset } from './tileset';


/**
 * Bag that stores `Tileset` items as `LocalTileset`.
 *
 * The bag manages ID ranges for newly added tilesets automatically.
 *
 * @see LocalTileset
 */
export class LocalTilesetBag {

  /** @internal */
  public readonly items: LocalTileset[] = [];

  /** Contains the amount of tilesets that are contained in this bag. */
  public get size(): number {
    return this.items.length;
  }

  /**
   * Returns the next ID that can be used as the firstID in the ID range of a
   * local tileset.
   */
  public getNextFirstId(): number {
    return Math.max(0, ...this.items.map(item => item.lastId)) + 1;
  }

  /**
   * Adds an existing local `tileset`.
   *
   * This method is unsafe because it does not check if the ID range of the provided
   * local tileset overlaps with the range of another tileset.
   */
  public set(tileset: LocalTileset): this {
    this.items.push(tileset);

    return this;
  }

  /** Adds `tileset` to the bag. */
  public add(tileset: Tileset): LocalTileset {
    const local = new LocalTileset(tileset, this.getNextFirstId());

    this.items.push(local);

    return local;
  }

  /**
   * Returns the `LocalTileset` of `tileset`, or `undefined` if the tileset is not
   * part of this bag.
   */
  public find(tileset: Tileset): LocalTileset | undefined {
    return this.items.find(item => item.tileset === tileset);
  }

  /** Returns `true` if `tileset` is part of this bag. */
  public has(tileset: Tileset): boolean {
    return this.items.some(item => item.tileset === tileset);
  }

  /**
   * Returns the `LocalTileset` for `tileset`. If `tileset` is not yet a local tileset
   * of this bag, it will be added automatically.
   */
  public resolve(tileset: Tileset): LocalTileset {
    const item = this.find(tileset);

    return item ? item : this.add(tileset);
  }

  /**
   * Returns the `LocalTileset` for a global tile ID. Throws an error if the ID is not
   * in range of the local tilesets in this bag.
   */
  public getFromGlobalId(globalId: number): LocalTileset {
    const tileset = this.items.find(
      item => item.firstId <= globalId && item.lastId >= globalId
    );

    if (! tileset) {
      throw new Error(`Global tile ID ${globalId} does not match any filesets`);
    }

    return tileset;
  }

}

