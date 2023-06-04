import { Handle } from '@heliks/tiles-assets';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Terrain } from './terrain';


/**
 * A collection of tiles
 *
 * - `S`: Spritesheet format
 */
export class Tileset {

  /** Custom name assigned to the tileset. */
  public name?: string;

  /**
   * Contains tile indexes mapped to the name of an animation on {@link spritesheet}
   * that should be played when the tile is rendered on a {@link Tilemap}.
   *
   * @internal
   */
  private readonly animations = new Map<number, string>();

  /** @internal */
  private readonly terrains = new Map<string, Terrain>();

  /**
   * @param spritesheet Handle to the {@link SpriteSheet} used by this tileset.
   * @param size Total amount of tiles that are contained in this tileset.
   */
  constructor(
    public readonly spritesheet: Handle<SpriteSheet>,
    public readonly size: number
  ) {}

  /** Adds a `terrain` to the tileset. */
  public addTerrain(terrain: Terrain): this {
    if (this.terrains.has(terrain.name)) {
      throw new Error(`Terrain name ${terrain.name} is already in use.`);
    }

    this.terrains.set(terrain.name, terrain);

    return this;
  }

  /**
   * Returns the {@link Terrain} with the given `name`. Throws an error if no terrain
   * with that name exists.
   */
  public getTerrain(name: string): Terrain {
    const terrain = this.terrains.get(name);

    if (! terrain) {
      throw new Error(`Unknown terrain ${name}`);
    }

    return terrain;
  }

  /**
   * Returns the name of the {@link spritesheet} animation that should be played when
   * a tile index is added to a {@link Tilemap}.
   */
  public getAnimationName(tileIdx: number): string | undefined {
    return this.animations.get(tileIdx);
  }

  /**
   * Assigns the {@link spritesheet} animation `name` to a tile index. Tiles that have an
   * animation assigned will be automatically animated when added to a {@link Tilemap}.
   */
  public setAnimationName(tileIdx: number, name: string): this {
    this.animations.set(tileIdx, name);

    return this;
  }

}

