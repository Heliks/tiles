export enum TerrainBit {
  North = 1,
  NorthEast = 2,
  NorthWest = 128,
  South = 16,
  SouthEast = 8,
  SouthWest = 32,
  East = 4,
  West = 64
}

/**
 * A terrain ID is a bitset of {@link TerrainBit} bits. Tile indexes mapped to this ID
 * should cover every edge for every bit int this set. For example:
 *
 *  ```ts
 *  // Tiles mapped to this terrain ID are supposed to cover the north-east corner and
 *  // the northern edge.
 *  const terrainId = TerrainBit.North | TerrainBit.NorthEast;
 *  ```
 */
export type TerrainId = number;

/**
 * Maps a tile index to a terrain ID.
 *
 * @see TerrainId
 */
export interface TerrainRule {
  terrainId: TerrainId;
  tileIndex: number;
}

/**
 * Terrains are a set of rules that define which tiles should be displayed next to each
 * other in a `TileGrid`. For example, if we were to draw a patch of grass or a body of
 * water, it can automatically decide where edges or transitions to other tiles should
 * be placed.
 */
export class Terrain {

  /** @internal */
  private readonly rules: TerrainRule[] = [];

  /** @internal */
  private readonly indexes = new Set<number>();

  /**
   * @param name Display name. This does not have any technical effect on the terrain
   *  itself as it is mainly for debugging / maintenance purposes.
   */
  constructor(public readonly name: string) {}

  public static createId(...bits: TerrainBit[]): TerrainId {
    let terrainId = 0;

    for (const bit of bits) {
      terrainId |= bit;
    }

    return terrainId;
  }

  public rule(tile: number, terrainId: TerrainId): this {
    this.rules.push({
      tileIndex: tile,
      terrainId
    });

    this.indexes.add(tile);

    return this;
  }

  /** Returns `true` if a `tile` index has a {@link TerrainRule}. */
  public hasRule(tile: number): boolean {
    return this.indexes.has(tile);
  }

  public getRules(terrainId: number): TerrainRule[] {
    return this.rules.filter(item => item.terrainId === terrainId);
  }

}
