import { SpriteSheet } from "./sprite-sheet";
import { FlipDirection } from "../utils";
import { Handle } from "@tiles/assets";


/**
 * Component used to render a sprite.
 */
export class SpriteDisplay {

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /**
   * The direction in which the sprite should be flipped. Changing this
   * requires re-rendering the sprite.
   */
  public flip = FlipDirection.None;

  /**
   * @param sheet The sprite sheet used to render `sprite`.
   * @param spriteIndex Index of the sprite that should be rendered.
   */
  constructor(
    public sheet: Handle<SpriteSheet>,
    public spriteIndex: number
  ) {}

  /**
   * Sets the sprite that should be rendered to the sprite matching the given
   * `index` on the displays sprite sheet. Queues the component for re-
   * rendering.
   */
  public setIndex(index: number): this {
    this.spriteIndex = index;
    this.dirty = true;

    return this;
  }

  /**
   * Flips the sprite in the given direction and queues the sprite for re-
   * rendering if necessary.
   */
  public flipTo(direction = FlipDirection.Horizontal): this {
    if (this.flip !== direction) {
      this.flip = direction;
      this.dirty = true;
    }

    return this;
  }

}
