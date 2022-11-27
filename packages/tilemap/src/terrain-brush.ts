import { getRandomItem, Grid } from '@heliks/tiles-engine';
import { LocalTileset, Terrain, TerrainBit, TerrainId, TerrainRule } from './tileset';
import { Tilemap } from './tilemap';


/**
 * Draws terrain on a tilemap.
 *
 * @see Terrain
 * @see Tilemap
 */
export class TerrainBrush {

  /** @internal */
  private get grid(): Grid {
    return this.tilemap.grid;
  }

  /**
   * @param tilemap Tilemap on which the terrain should be drawn.
   * @param tileset Tileset used to draw the terrain.
   * @param terrain Terrain that will be drawn by this brush.
   */
  constructor(
    public readonly tilemap: Tilemap,
    public readonly tileset: LocalTileset,
    public readonly terrain: Terrain
  ) {}

  /** @internal */
  private getTileIdAt(col: number, row: number): number {
    return this.tilemap.get(this.grid.getIndex(col, row));
  }

  /** Returns `true` if the tile at a tilemap location is part of the {@link Terrain}. */
  public isTerrainTile(col: number, row: number): boolean {
    if (this.grid.isLocationInBounds(col, row)) {
      const tileId = this.getTileIdAt(col, row);

      if (this.tileset.checkId(tileId)) {
        return this.terrain.hasRule(this.tileset.getLocalIndex(tileId));
      }
    }

    return false;
  }

  /** Returns the appropriate {@link TerrainId} for a tilemap location. */
  public getTerrainId(col: number, row: number): TerrainId {
    let terrainId = 0;

    if (this.isTerrainTile(col, row - 1)) terrainId |= TerrainBit.North;
    if (this.isTerrainTile(col + 1, row - 1)) terrainId |= TerrainBit.NorthEast;
    if (this.isTerrainTile(col - 1, row - 1)) terrainId |= TerrainBit.NorthWest;

    if (this.isTerrainTile(col, row + 1)) terrainId |= TerrainBit.South;
    if (this.isTerrainTile(col + 1, row + 1)) terrainId |= TerrainBit.SouthEast;
    if (this.isTerrainTile(col - 1, row + 1)) terrainId |= TerrainBit.SouthWest;

    if (this.isTerrainTile(col + 1, row)) terrainId |= TerrainBit.East;
    if (this.isTerrainTile(col - 1, row)) terrainId |= TerrainBit.West;

    return terrainId;
  }

  /** @internal */
  private match(col: number, row: number): TerrainRule[] {
    return this.terrain.match(this.getTerrainId(col, row));
  }

  /** @internal */
  private getRandomTileId(rules: TerrainRule[]): number {
    // If a terrain is configured correctly, we match a single rule in most cases. It is
    // however possible in theory to have two rules match at the same time. In this case,
    // pick a random one.
    const rule = getRandomItem(rules);

    // From the rule, pick a random tile index and convert it to a global tile ID.
    return this.tileset.getGlobalId(
      getRandomItem(rule.indexes) + 1
    );
  }

  /**
   * Returns the global ID of the tile should be drawn on a tilemap location if it were
   * part of the terrain.
   *
   * Internally matches {@link TerrainRule terrain rules} for that location, converts
   * a random tile index of that rule to a global tile ID and returns it. If there are
   * multiple matching rules, a random one will be picked. If there are no matches, `0`
   * will be returned.
   */
  public getTileId(col: number, row: number): number {
    const rules = this.match(col, row);

    return rules.length > 0
      ? this.getRandomTileId(rules)
      : 0;
  }

  /** @internal */
  private _updateNeighbourTile(col: number, row: number) {
    if (this.isTerrainTile(col, row)) {
      const tileId = this.getTileId(col, row);

      if (tileId > 0) {
        this.tilemap.set(this.grid.getIndex(col, row), tileId);
      }
    }
  }

  /**
   * Draws terrain at a tilemap location. Returns `false` if no data has changed after
   * drawing at that location.
   */
  public draw(col: number, row: number): boolean {
    const idx = this.grid.getIndex(col, row);
    const gId = this.getTileId(col, row);

    if (this.tilemap.set(idx, gId)) {
      this._updateNeighbourTile(col, row - 1);
      this._updateNeighbourTile(col + 1, row - 1);
      this._updateNeighbourTile(col - 1, row - 1);

      this._updateNeighbourTile(col, row + 1);
      this._updateNeighbourTile(col + 1, row + 1);
      this._updateNeighbourTile(col - 1, row + 1);

      this._updateNeighbourTile(col + 1, row);
      this._updateNeighbourTile(col - 1, row);

      return true;
    }

    return false;
  }

}
