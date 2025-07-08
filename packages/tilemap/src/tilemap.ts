import { AssetLoader } from '@heliks/tiles-assets';
import { createPackedArray, Grid, Serialize, TypeId, Vec2, World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { AnimatedSprite, Container } from 'pixi.js';
import { LocalTileset, LocalTilesetBag, Tileset } from './tileset';


/** Serialized data of a {@link LocalTileset} */
export interface LocalTilesetData {
  /** @see LocalTileset.firstId */
  firstId: number;
  /** @see LocalTileset.firstId */
  file: string;
}

/** Serialized data of a {@link Tilemap} */
export interface TilemapData {
  /** @see Tilemap.data */
  data: number[];
  /** @see Tilemap.tilesets */
  tilesets: LocalTilesetData[];
}

/**
 * Component that renders a tilemap at the world position of the entity to which it is
 * attached to.
 *
 * ## Serialization
 *
 * Tilemaps fully support automatic serialization. However, since tilemaps don't accept
 * asset handles & require their tilesets to be fully loaded at the time they are created,
 * they must be deserialized async and therefore, manually.
 *
 * Invoke `Tilemap.restore()` to manually restore a tilemap from serialized data:
 *
 * ```ts
 *  async function load(world: World): Promise<Tilemap> {
 *    const tilemap = new Tilemap();
 *
 *    // Restore happens async.
 *    await Tilemap.restore(world, tilemap, data);
 *
 *    // Insert tilemap into the world.
 *    world.insert(tilemap, new Transform(0, 0));
 *
 *    return tilemap;
 *  }
 *
 *  load(world).then(tilemap => {
 *    console.log('Loaded restored tilemap', tilemap);
 *  });
 * ```
 */
@TypeId('tiles_tilemap')
export class Tilemap<T extends Tileset = Tileset> implements Serialize<TilemapData> {

  /**
   * Defines the tilemaps pivot point as a percentage of its size.
   *
   * For example:
   *
   * - `(0.5, 0.5)` Pivot is at the tilemaps center.
   * - `(0.0, 0.0)` Pivot is at the tilemaps top left corner.
   */
  public readonly pivot = new Vec2(0, 0);

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

  /** @internal */
  private static async _tilesets(world: World, data: LocalTilesetData): Promise<LocalTileset> {
    const loader = world.get(AssetLoader);
    const handle = await loader.async<Tileset>(data.file);

    return new LocalTileset(loader.assets.resolve(handle), data.firstId);
  }

  /**
   * Restores serialized `data` on the given `tilemap`.
   *
   * @param world Entity world.
   * @param tilemap Tilemap on which data will be restored.
   * @param data Data to restore.
   */
  public static async restore(world: World, tilemap: Tilemap, data: TilemapData): Promise<void> {
    const tilesets = await Promise.all(
      data.tilesets.map(item => Tilemap._tilesets(world, item))
    );

    // Todo: This could potentially become unsafe in the future.
    tilemap.tilesets.items.push(...tilesets);

    // Data can be set only after tilesets have been restored.
    tilemap.setAll(data.data);
  }

  /** @inheritDoc */
  public serialize(): TilemapData {
    const tilesets = this.tilesets.items.map(local => {
      return {
        file: local.tileset.file,
        firstId: local.firstId
      };
    });

    return { tilesets, data: this.data };
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

