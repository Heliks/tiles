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
   * @param sheet Sprite sheet used to render `sprite`. If a `Handle<SpriteSheet>` is
   *  passed the sprite rendering is deferred until the asset is loaded.
   * @param spriteIndex Index of the sprite on [[sheet]] that should be rendered.
   * @param layer The layer on which the sprite should be rendered. Sprites on a lower
   *  layer with always be rendered before sprites on a higher one.
   */
  constructor(
    public sheet: SpriteSheet | Handle<SpriteSheet>,
    public spriteIndex: number,
    public layer = 0
  ) {}

  /**
   * Sets the sprite that should be rendered to the sprite matching the given `index` on
   * the displays sprite sheet. Queues the component for re-rendering.
   */
  public setIndex(index: number): this {
    this.spriteIndex = index;
    this.dirty = true;

    return this;
  }

  /**
   * Flips the sprite in the given direction and queues the sprite for re- rendering if
   * necessary.
   */
  public flipTo(direction = FlipDirection.Horizontal): this {
    if (this.flip !== direction) {
      this.flip = direction;
      this.dirty = true;
    }

    return this;
  }

}
