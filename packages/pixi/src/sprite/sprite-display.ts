import { Handle } from '@tiles/assets';
import { SpriteSheet } from './sprite-sheet';

export enum FlipDirection {
  None = 'none',
  Both = 'both',
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export interface SpriteAnimation {
  /** The frames on the sprite sheet that are used to create the animation. */
  frames: number[];
  /** The speed in which the animation should be played. By default the speed is `1`. */
  speed?: number;
  /** The direction in which the sprite should be flipped. `None` by default. */
  flip?: FlipDirection;
}

/**
 * Component used to render a sprite.
 */
export class SpriteDisplay {

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /**
   * @param sheet The sprite sheet used to render `sprite`.
   * @param sprite The sprite that should be rendered.
   */
  constructor(
    public sheet: SpriteSheet,
    public sprite: SpriteAnimation | number
  ) {}

  /** Sets the sprite to a sprite matching the given `id` on the displays [[sheet]]. */
  public setSpriteId(id: number): this {
    this.sprite = id;
    this.dirty = true;

    return this;
  }

  /** Animates the sprite with the given `data`. */
  public setAnimationData(data: SpriteAnimation): this {
    this.sprite = data;
    this.dirty = true;

    return this;
  }

}
