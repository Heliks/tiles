import { LocalTileset, Terrain, TerrainTile } from '../tileset';
import { TerrainBrush } from './terrain-brush';
import { Tilemap } from '../tilemap';
import { getRandomInt } from '@heliks/tiles-engine';


/** Enum that contains bits that each represent a corner on a tile. */
export enum CornerBit {
  NorthEast = 1,
  NorthWest = 8,
  SouthEast = 2,
  SouthWest = 4
}

/**
 * ID from 0 to 15, where each ID is a tile in a 2-corner wang set.
 *
 * @see CornerTerrain
 */
export type CornerTileId = number;

/**
 * Terrain with a total of 16 tiles based on edge-adjacency. Corner terrains are best
 * suited to create patches of matching terrain, like floors, grass, etc.
 *
 * @see Terrain
 * @see http://cr31.co.uk/stagecast/wang/2corn.html
 */
export type CornerTerrain = Terrain<CornerTileId>;


/** @inheritDoc */
export class CornerBrush implements TerrainBrush<CornerTileId> {

  constructor(
    private readonly tileset: LocalTileset,
    private readonly terrain: CornerTerrain
  ) {}

  /** @internal */
  private isTerrainTile(map: Tilemap, col: number, row: number): boolean {
    const id = map.get(map.grid.getIndex(col, row));

    return this.tileset.checkId(id)
      ? this.terrain.isDefined(this.tileset.getLocalIndex(id))
      : false;
  }

  /** @inheritDoc */
  public getTerrainTileId(map: Tilemap, col: number, row: number): CornerTileId {
    let tile = 0;

    if (this.isTerrainTile(map, col - 1, row - 1)) tile |= CornerBit.NorthWest;
    if (this.isTerrainTile(map, col + 1, row - 1)) tile |= CornerBit.NorthEast;
    if (this.isTerrainTile(map, col - 1, row + 1)) tile |= CornerBit.SouthWest;
    if (this.isTerrainTile(map, col + 1, row + 1)) tile |= CornerBit.SouthEast;

    return tile;
  }

  /** @inheritDoc */
  public getTerrainTiles(map: Tilemap, col: number, row: number): TerrainTile<CornerTileId>[] {
    return this.terrain.get(this.getTerrainTileId(map, col, row));
  }

  public getTileId(map: Tilemap, col: number, row: number) {
    const tiles = this.getTerrainTiles(map, col, row);


    if (tiles.length === 0) {
      return 0;
    }

    const index = tiles[getRandomInt(tiles.length - 1)];

    return this.tileset.getGlobalId(index.tileIndex);
  }

  public draw(map: Tilemap, col: number, row: number) {
    const idx = map.grid.getIndex(col, row);
    const gId = this.getTileId(map, col, row);

    if (! map.set(idx, gId)) {
      return false;
    }

    return true;
  }

}
