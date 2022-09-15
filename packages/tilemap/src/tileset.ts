import { Sprite, SpriteSheet } from '@heliks/tiles-pixi';


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

  /** Creates a sprite from the tile at the given `index`. */
  public sprite(index: number): Sprite {
    return this.spritesheet.sprite(index);
  }

}

