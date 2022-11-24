import { LocalTileset, Terrain, TerrainTile } from './tileset';
import { Tilemap } from './tilemap';
import { getRandomInt } from '@heliks/tiles-engine';


export enum TerrainBit {
  North = 1,
  East = 2,
  South = 4,
  West = 8
}


/**
 * Utility that allows drawing a {@link Terrain} on a {@link Tilemap}.
 *
 * @see Terrain
 * @see Tilemap
 */
export class TerrainBrush {

  constructor(
    private readonly tileset: LocalTileset,
    private readonly terrain: Terrain
  ) {}

  /** Returns `true` if the tile at a tilemap location is part of the {@link terrain}. */
  public isTerrainTile(map: Tilemap, col: number, row: number): boolean {
    if (map.grid.isLocationInBounds(col, row)) {
      const tileId = map.get(map.grid.getIndex(col, row));

      if (this.tileset.checkId(tileId)) {
        return this.terrain.isDefined(this.tileset.getLocalIndex(tileId));
      }
    }

    return false;
  }

  /** Returns the appropriate {@link TerrainTile} id for a tilemap location. */
  public getTerrainTileId(map: Tilemap, col: number, row: number): number {
    let tile = 0;

    if (this.isTerrainTile(map, col, row - 1)) tile |= TerrainBit.North;
    if (this.isTerrainTile(map, col + 1, row)) tile |= TerrainBit.East;
    if (this.isTerrainTile(map, col, row + 1)) tile |= TerrainBit.South;
    if (this.isTerrainTile(map, col - 1, row)) tile |= TerrainBit.West;

    return tile;
  }

  /** Returns all appropriate {@link TerrainTile} for a tilemap location. */
  public getTerrainTiles(map: Tilemap, col: number, row: number): TerrainTile[] {
    return this.terrain.get(this.getTerrainTileId(map, col, row));
  }

  /**
   * Returns the global ID of the tile should be drawn on a tilemap location if it were
   * part of the terrain.
   *
   * Internally this fetches the {@link TerrainTile terrain tiles} for that location and
   * resolves the local tile index mapping to a global tile ID. If there are multiple
   * mappings, a random one will be picked.
   */
  public getTileId(map: Tilemap, col: number, row: number): number {
    const tiles = this.getTerrainTiles(map, col, row);

    if (tiles.length === 0) {
      return 0;
    }

    const index = tiles[getRandomInt(tiles.length - 1)];

    return this.tileset.getGlobalId(index.tileIndex + 1);
  }

  /** @internal */
  private _updateNeighbourTile(map: Tilemap, col: number, row: number) {
    if (this.isTerrainTile(map, col, row)) {
      map.set(map.grid.getIndex(col, row), this.getTileId(map, col, row));
    }
  }

  /**
   * Draws terrain at a tilemap location. Returns `false` if no data has changed after
   * drawing at that location.
   */
  public draw(map: Tilemap, col: number, row: number): boolean {
    const idx = map.grid.getIndex(col, row);
    const gId = this.getTileId(map, col, row);

    if (map.set(idx, gId)) {
      this._updateNeighbourTile(map, col, row - 1);
      this._updateNeighbourTile(map, col + 1, row);
      this._updateNeighbourTile(map, col, row + 1);
      this._updateNeighbourTile(map, col - 1, row);

      return true;
    }

    return false;
  }

}
