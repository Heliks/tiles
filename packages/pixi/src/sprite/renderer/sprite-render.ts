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

  /**
   * Origin position of the sprite. Do not update this directly, and use the `setAnchor()`
   * method instead.
   */
  public anchor = new Vec2(0, 0);

  /** Indicates if the sprite needs to be re-rendered.*/
  public dirty = true;

  /** If set to `true` the sprite will be flipped on the x axis. */
  public flipX = false;

  /** If set to `true` the sprite will be flipped on the y axis. */
  public flipY = false;

  /** Scale factor of the sprite. */
  public scale = new Vec2(1, 1);

  /** @internal */
  public _group?: Entity;

  /** The opacity of the sprite. Value from 0-1. */
  public set opacity(opacity: number) {
    this._sprite.alpha = opacity;
  }

  public get opacity(): number {
    return this._sprite.alpha;
  }

  /** If this is set to `false`, the sprite will not be rendered. */
  public set visible(value: boolean) {
    this._sprite.visible = value;
  }

  public get visible(): boolean {
    return this._sprite.visible;
  }

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
    public group?: Entity
  ) {
    // Using the middle position instead of the top-left position will save us extra
    // calculations during the renderer update.
    this.setAnchor(0.5, 0.5);
  }

  /**
   * Sets the index of the sprite that should be rendered. Returns `false` if that index
   * is already set. If the sprite was changed, the component is marked as {@link dirty}.
   */
  public setIndex(index: number): boolean {
    if (this.spriteIndex === index) {
      return false;
    }

    this.spriteIndex = index;
    this.dirty = true;

    return true;
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

  /** Sets the {@link visible visibility} of this sprite to `true`. */
  public show(): this {
    this._sprite.visible = true;

    return this;
  }

  /** Sets the {@link visible visibility} of this sprite to `false`. */
  public hide(): this {
    this._sprite.visible = false;

    return this;
  }

}
