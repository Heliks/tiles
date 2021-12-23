import { Handle } from '@heliks/tiles-assets';
import { Entity, Vec2 } from '@heliks/tiles-engine';
import { Sprite } from 'pixi.js';
import { SpriteSheet } from '../sprite-sheet';


/**
 * Component that when attached to an entity, will render a sprite. By default the sprite
 * anchor is the middle of the sprite.
 */
export class SpriteRender {

  /** @internal */
  public readonly _sprite = new Sprite();

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /** If set to `true` the sprite will be flipped on the x axis. */
  public flipX = false;

  /** If set to `true` the sprite will be flipped on the y axis. */
  public flipY = false;

  /** Scale factor of the sprite. */
  public scale = new Vec2(1, 1);

  /**
   * Origin position of the sprite. Do not update this directly, and use the `setAnchor()`
   * method instead.
   */
  public anchor = new Vec2(0, 0);

  /**
   * @param spritesheet Sprite sheet used to render `sprite`. If a `Handle<SpriteSheet>`
   *  is passed the rendering of the sprite will be deferred until the asset is loaded.
   * @param spriteIndex Index of the sprite that should be rendered.
   * @param group (optional) Entity that has a `RenderGroup` component. The sprite
   *  will be added to that group instead of the stage.
   */
  constructor(
    public spritesheet: SpriteSheet | Handle<SpriteSheet>,
    public spriteIndex: number,
    public readonly group?: Entity
  ) {
    // Using the middle position instead of the top-left position will save us extra
    // calculations during the renderer update.
    this.setAnchor(0.5, 0.5);
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

  /** Flips the sprite. */
  public flip(x = false, y = false): this {
    this.flipX = x;
    this.flipY = y;

    return this;
  }

  /** Updates the position where the sprite is anchored relative to its position. */
  public setAnchor(x: number, y: number): this {
    this._sprite.anchor.set(x, y);

    this.anchor.x = this._sprite.anchor.x;
    this.anchor.y = this._sprite.anchor.y;

    return this;
  }

}
