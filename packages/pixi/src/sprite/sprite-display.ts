import { SpriteSheet } from "./sprite-sheet";

/**
 * Component used to render a sprite.
 */
export class SpriteDisplay {

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /**
   * @param sheet The sprite sheet used to render `sprite`.
   * @param spriteIndex Index of the sprite that should be rendered.
   */
  constructor(
    public sheet: SpriteSheet,
    public spriteIndex: number
  ) {}

  /**
   * Sets the sprite that should be rendered to the sprite matching the
   * given `index` on the displays sprite shit.
   */
  public setSprite(index: number): this {
    this.spriteIndex = index;
    this.dirty = true;

    return this;
  }

}