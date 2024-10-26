import { TerrainId } from './terrain';


/**
 * Defines a rule to match a {@link TerrainId}.
 *
 * The terrain id must pass two criteria to match this rule. First, it needs to contain
 * all bits from the `contains` bitset. Last, it is not allowed to contain any bits of
 * the `excludes` bitset.
 */
export class TerrainRule {

  /**
   * @param indexes Tile indexes mapped to this rule. If this rule is matched, the
   *  terrain brush will draw a random tile from this list.
   * @param contains All {@link TerrainBit terrain bits} that must be contained.
   * @param excludes All {@link TerrainBit terrain bits} that must be excluded.
   */
  constructor(
    public readonly indexes: number[],
    public readonly contains: TerrainId = 0,
    public readonly excludes: TerrainId = 0
  ) {}

  /** Returns `true` if a {@link TerrainId} matches a rule. */
  public test(terrainId: TerrainId): boolean {
    return (this.contains & terrainId) === this.contains && (terrainId & this.excludes) === 0
  }

}
