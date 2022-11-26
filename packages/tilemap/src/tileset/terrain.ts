import { TerrainRule } from './terrain-rule';


/**
 * Contains a bit for each possible side that a {@link Terrain} can "query" to check
 * for adjacent tiles.
 */
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
 * A terrain ID is a bitset of {@link TerrainBit terrain bits} and represents which
 * sides and corners a tile that belongs to a {@link Terrain} covers.
 *
 *  ```ts
 *  // Tiles mapped to this terrain ID are supposed to cover the north-east corner and
 *  // the northern edge.
 *  const terrainId = TerrainBit.North | TerrainBit.NorthEast;
 *  ```
 */
export type TerrainId = number;

/**
 * Terrains are a set of rules that control which tiles should be drawn adjacent to
 * each other in a {@link Tilemap}. For example, if we were to draw a patch of grass
 * or a body of water, it can automatically decide where edges or transitions to other
 * tiles should be drawn.
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

  /** Creates a {@link TerrainId}, using the given `bits. */
  public static createId(...bits: TerrainBit[]): TerrainId {
    let terrainId = 0;

    for (const bit of bits) {
      terrainId |= bit;
    }

    return terrainId;
  }

  /** Defines a new {@link TerrainRule}. */
  public rule(tile: number, contains: TerrainId, excludes: TerrainId = 0): this {
    this.rules.push(new TerrainRule(
      tile,
      contains,
      excludes
    ));

    this.indexes.add(tile);

    return this;
  }

  /** Returns `true` if a `tile` index has a {@link TerrainRule}. */
  public hasRule(tile: number): boolean {
    return this.indexes.has(tile);
  }

  /** Returns all {@link TerrainRule terrain rules} with the given `tileIndex`. */
  public getTileRules(tileIndex: number): TerrainRule[] {
    return this.rules.filter(item => item.tileIndex === tileIndex);
  }

  /** Returns all {@link TerrainRule terrain rules} that match the given `terrainId`. */
  public match(terrainId: TerrainId): TerrainRule[] {
    return this.rules.filter(item => item.test(terrainId));
  }

}
