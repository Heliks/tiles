import { Handle } from '@heliks/tiles-assets';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Terrain } from './terrain';


/**
 * A collection of tiles
 *
 * - `S`: Spritesheet format
 */
export class Tileset<S extends SpriteSheet = SpriteSheet> {

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

}

