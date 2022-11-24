/**
 * Maps a tile ID in a terrain to a tile index of a tileset. A terrain can have more
 * than one terrain tile with the same `terrainId`.
 */
export interface TerrainTile {
  terrainId: number;
  tileIndex: number;
}

export enum TerrainType {
  Corner,
  Edge
}

/**
 * Terrains are a set of rules that define which tiles should be displayed next to each
 * other in a `TileGrid`. For example, if we were to draw a patch of grass or a body of
 * water, it can automatically decide where edges or transitions to other tiles should
 * be placed.
 *
 * The number of possible tiles in a terrain varies depending on the terrain type. For
 * example, a common 2-edge wang set has a total of 16 tiles, while a blob tileset can
 * have up to 256.
 */
export class Terrain {

  /** @internal */
  private readonly tiles: TerrainTile[] = [];

  /**
   * Fast lookup for mapped tile indexes.
   * @internal
   */
  private readonly indexes = new Set<number>();

  /**
   * @param name Display name. This does not have any technical effect on the terrain
   *  itself as it is mainly for debugging / maintenance purposes.
   */
  constructor(public readonly name: string) {}

  /** Maps `terrainId` to one or more tile `indexes`. */
  public set(terrainId: number, ...indexes: number[]): this {
    for (const idx of indexes) {
      this.tiles.push({
        terrainId: terrainId,
        tileIndex: idx
      });

      this.indexes.add(idx);
    }

    return this;
  }

  /** Returns all {@link TerrainTile} with the given `terrainId`. */
  public get(terrainId: number): TerrainTile[] {
    return this.tiles.filter(item => item.terrainId === terrainId);
  }

  /** Returns `true` if `tileIdx` is mapped to any {@link TerrainTile}. */
  public isDefined(tileIdx: number): boolean {
    return this.indexes.has(tileIdx);
  }

}
