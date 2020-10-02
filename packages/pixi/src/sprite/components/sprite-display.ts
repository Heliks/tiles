import { SpriteSheet } from '../sprite-sheet';
import { Handle } from '@heliks/tiles-assets';
import { Sprite } from 'pixi.js';
import { NodeHandle } from '../../stage';
import { FlipMode } from '../flip';

/**
 * Component used to render a sprite.
 */
export class SpriteDisplay extends Sprite {

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /** Direction(s) in which the sprite should be flipped. */
  public flipMode = FlipMode.None;

  /**
   * @param spritesheet Sprite sheet used to render `sprite`. If a `Handle<SpriteSheet>`
   *  is passed the rendering of the sprite will be deferred until the asset is loaded.
   * @param spriteIndex Index of the sprite that should be rendered.
   * @param node (optional) Reference to the node to which this sprite display should
   *  be attached to as opposed to the stage root.
   */
  constructor(
    public spritesheet: SpriteSheet | Handle<SpriteSheet>,
    public spriteIndex: number,
    public node?: NodeHandle
  ) {
    super();

    // The engine uses center aligned positions instead of top-left. This will save us
    // a calculation in the renderer `update()`.
    this.anchor.set(0.5);
  }

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
  public flipTo(direction = FlipMode.Horizontal): this {
    if (this.flipMode !== direction) {
      this.flipMode = direction;
      this.dirty = true;
    }

    return this;
  }

}
