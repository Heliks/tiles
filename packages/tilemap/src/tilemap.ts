import { Entity, Grid } from '@heliks/tiles-engine';
import { Container } from '@heliks/tiles-pixi';
import { Tileset } from './tileset';
import { TilesetBag } from './tileset-bag';


export class Tilemap extends TilesetBag {

  /** @internal */
  public readonly view = new Container();

  /** The opacity of the tilemap. Value from 0-1. */
  public set opacity(opacity: number) {
    this.view.alpha = opacity;
  }

  public get opacity(): number {
    return this.view.alpha;
  }

  /**
   * @param grid Grid that represent the boundaries of the tilemap and the constrains
   *  where individual tiles will be placed.
   * @param tilesets Collection of tilesets that are used for rendering the tiles.
   * @param data Tile data.
   * @param group (optional) Entity that has a `RenderGroup` component. The tilemap
   *  will be added to that group instead of the stage.
   */
  constructor(
    public readonly grid: Grid,
    public readonly tilesets: Tileset[],
    public readonly data: number[],
    public readonly group?: Entity
  ) {
    super();
  }

}
