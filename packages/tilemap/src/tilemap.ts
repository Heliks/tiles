import { createPackedArray, Grid } from '@heliks/tiles-engine';
import { Container, LayerId } from '@heliks/tiles-pixi';
import { LocalTilesetBag, Tileset } from './tileset';
import { AnimatedSprite } from 'pixi.js';


/**
 * Component that when added to an entity, will render a tilemap on its world position. A
 * tilemap is essentially a grid where each cell can possibly contain a tile.
 */
export class Tilemap<T extends Tileset = Tileset> {

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
  public tilesets = new LocalTilesetBag<T>();

  /**
   * Contains the display object on which the tilemap will be rendered.
   *
   * @internal
   */
  public readonly view = new Container();

  /**
   * Contains {@link AnimatedSprite animated sprites} that need to be updated by the
   * tilemap renderer. This has to be done manually because we do not use the internal
   * PIXI ticker to update the renderer.
   *
   * @internal
   */
  public readonly _animations: AnimatedSprite[] = [];

  /** The opacity of the tilemap. Value from 0-1. */
  public set opacity(opacity: number) {
    this.view.alpha = opacity;
  }

  public get opacity(): number {
    return this.view.alpha;
  }

  /**
   * @param grid Grid that defines the boundaries of the tilemap.
   * @param layer (optional) Renderer layer ID.
   */
  constructor(public readonly grid: Grid, public readonly layer?: LayerId) {
    this.data = createPackedArray(grid.size, 0);
  }

  /**
   * Sets a global `tileId` at the given cell `index`. If this changes the tile ID that
   * occupies that index, the tilemap is marked as {@link dirty}. Returns `false` if no
   * data was changed.
   */
  public set(cell: number, tileId: number): boolean {
    if (this.grid.isIndexInBounds(cell) && this.data[ cell ] !== tileId) {
      this.data[ cell ] = tileId;
      this.dirty = true;

      return true;
    }

    return false;
  }

  /**
   * Overwrites the existing tilemap data. The new `data` must have a length equal to
   * the size of the tilemap.
   *
   * @see data
   */
  public setAll(data: number[]): this {
    if (data.length !== this.grid.size) {
      throw new Error('Data must have equal indexes to tilemap size.');
    }

    this.data.length = 0;
    this.data.push(...data);

    this.dirty = true;

    return this;
  }

  /**
   * Returns the tile ID that occupies a `cell` index. Returns `0` if `cell` is outside
   * the boundaries of the tilemap grid, or if that cell is not occupied by any tile.
   */
  public get(cell: number): number {
    return this.grid.isIndexInBounds(cell) ? this.data[ cell ] : 0;
  }

}

