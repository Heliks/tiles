import { Sprite, SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';


/** Collection of tiles */
export class Tileset {

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

}

