import { SpriteSheet } from "./sprite-sheet";

/**
 * Component used to render a sprite.
 */
export class SpriteDisplay {

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /**
   * @param sheet The sprite sheet used to render `sprite`.
   * @param spriteId Id of the sprite that should be rendered.
   */
  constructor(
    public sheet: SpriteSheet,
    public spriteId: number
  ) {}

  /** Sets the sprite to a sprite matching the given `id` on the displays [[sheet]]. */
  public setSpriteId(id: number): this {
    this.spriteId = id;
    this.dirty = true;

    return this;
  }

}