import { createPackedArray, Entity, Grid } from '@heliks/tiles-engine';
import { Container } from '@heliks/tiles-pixi';
import { LocalTilesetBag } from './tileset';


/**
 * Component that when added to an entity, will render a tilemap on its world position. A
 * tilemap is essentially a grid where each cell can possibly contain a tile.
 */
export class Tilemap {

  /**
   * Grid data. Each index represents a grid cell and each value a tile ID. If a cell
   * has a value of `0`, it means that that cell is not occupied by any tile. The data
   * is packed, which means that this array is guaranteed to have a length equal to size
   * of the grid of this tilemap.
   *
   * For example, the data of a 3x3 grid could be laid out like this:
   *
   * ```ts
   *  [
   *    0, 0, 0,
   *    0, 0, 0
   *    0, 0, 0
   *  ];
   * ```
   */
  public readonly data: number[];

  /**
   * Setting this to `true` will re-render the tilemap on the next frame. This should be
   * set when the data of this tilemap has changed.
   */
  public dirty = false;

  /**
   * Bag that stores tilesets that are used to render tiles. For every ID in `data`, this
   * must contain a tileset that matches its range.
   *
   * @see data
   */
  public tilesets = new LocalTilesetBag();

  /**
   * Contains the display object on which the tilemap will be rendered. Will either be
   * added directly to the stage or to a specific render group (if defined).
   *
   * @internal
   */
  public readonly view = new Container();

  /** The opacity of the tilemap. Value from 0-1. */
  public set opacity(opacity: number) {
    this.view.alpha = opacity;
  }

  public get opacity(): number {
    return this.view.alpha;
  }

  /**
   * @param grid Grid that defines the boundaries of the tilemap.
   * @param group (optional) Parent render group.
   */
  constructor(public readonly grid: Grid, public readonly group?: Entity) {
    this.data = createPackedArray(grid.size, 0);
  }

  /**
   * Sets a global `tileId` at the given cell `index`. If this changes the tile ID that
   * occupies that index, the tilemap is marked as {@link dirty}. Returns `false` if no
   * data was changed.
   */
  public set(cell: number, tileId: number): boolean {
    if (cell < 0 || cell >= this.grid.size || this.data[ cell ] === tileId) {
      return false;
    }

    this.data[ cell ] = tileId;
    this.dirty = true;

    return true;
  }

  /**
   * Returns the tile ID that occupies a `cell` index. Returns `0` if `cell` is outside
   * the boundaries of the tilemap grid, or if that cell is not occupied by any tile.
   */
  public get(cell: number): number {
    return this.grid.isIndexInBounds(cell) ? this.data[ cell ] : 0;
  }

}

