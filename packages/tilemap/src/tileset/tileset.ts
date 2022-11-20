import { Sprite, SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { Terrain } from './terrain';


/** Collection of tiles */
export class Tileset {

  /** @internal */
  private readonly terrains = new Map<string, Terrain>();

  /** Contains the total amount of tiles that exist on this tileset. */
  public get size(): number {
    return this.spritesheet.size();
  }

  /**
   * @param spritesheet Spritesheet for rendering individual sprites.
   */
  constructor(public readonly spritesheet: SpriteSheet) {}

  /** Creates a {@link Sprite} from the tile located at the given tile `index`. */
  public sprite(index: number): Sprite {
    return this.spritesheet.sprite(index);
  }

  /** Creates a {@link Texture} from the tile located at the given tile `index`. */
  public texture(index: number): Texture {
    return this.spritesheet.texture(index);
  }

  /** Adds a `terrain` to the tileset. */
  public addTerrain(terrain: Terrain): this {
    if (this.terrains.has(terrain.name)) {
      throw new Error(`Terrain name ${terrain.name} is already in use.`);
    }

    this.terrains.set(terrain.name, terrain);

    return this;
  }

  /** Returns the {@link Terrain} with the given `name`, if any. */
  public getTerrain(name: string): Terrain | undefined {
    return this.terrains.get(name);
  }

}

