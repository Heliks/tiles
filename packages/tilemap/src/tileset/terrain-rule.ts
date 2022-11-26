import { TerrainId } from './terrain';


/**
 * Defines a rule for a terrain to match a tile index.
 *
 * A {@link TerrainId} must pass two criteria to match this rule. First, it needs to
 * contain *all* bits from the `contains` bitset. Last, it is not allowed to contain
 * any bits of the `excludes` bitset.
 */
export class TerrainRule {

  /**
   * @param tileIndex Index of the tile that should be drawn when this rule is matched.
   * @param contains All {@link TerrainBit terrain bits} required to match this rule.
   * @param excludes All {@link TerrainBit terrain bits} that are allowed to be omitted.
   */
  constructor(
    public readonly tileIndex: number,
    public readonly contains: TerrainId = 0,
    public readonly excludes: TerrainId = 0
  ) {}

  /** Returns `true` if a {@link TerrainId} matches a rule. */
  public test(terrainId: TerrainId): boolean {
    return (this.contains & terrainId) === this.contains && (terrainId & this.excludes) === 0
  }

}
