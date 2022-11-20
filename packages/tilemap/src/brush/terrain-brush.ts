import { Tilemap } from '../tilemap';
import { TerrainTile } from '../tileset/terrain';


/** Utility that provides functionality to draw {@link Terrain} on a {@link Tilemap}. */
export interface TerrainBrush<I> {

  /** Returns the appropriate {@link TerrainTile} id for the location `col` and `row`. */
  getTerrainTileId(map: Tilemap, col: number, row: number): I;

  /** Returns all appropriate {@link TerrainTile} for the location `col` and `row`. */
  getTerrainTiles(map: Tilemap, col: number, row: number): TerrainTile<I>[];

}
