import { Vec2 } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { SpriteAnimation } from '../animation';


export interface SpriteAnimationFrames {
  /** Contains the indexes of all sprites of which the animation consists. */
  frames: number[];
  /** Duration in ms of how long each frame is displayed. */
  frameDuration?: number;
}

/** Valid types for a sprite ID. */
export type SpriteId = number | string;

/** A collection of sprites. */
export abstract class SpriteSheet<I extends SpriteId = SpriteId> {

  /** @internal */
  private readonly animations = new Map<string, SpriteAnimationFrames>();

  /** @internal */
  private readonly cache = new Map<I, Texture>();

  /** Returns the total amount of sprites in this spritesheet. */
  public abstract size(): number;

  /**
   * Returns the size of the sprite matching `id` in px. Depending on the sprite-sheet,
   * this can throw an error if no sprite matches that id.
   */
  public abstract getSpriteSize(id: I): Vec2;

  /** Internal implementation of the spritesheet {@link Texture} factory. */
  protected abstract _texture(id: I): Texture;

  /**
   * Creates a {@link Texture} from the sprite matching `id`. Depending on the sprite -
   * sheet, this can throw an error if no sprite matches that id.
   */
  public texture(id: I): Texture {
    let texture = this.cache.get(id);

    if (! texture) {
      texture = this._texture(id);
      this.cache.set(id, texture);
    }

    return texture;
  }

  /**
   * Creates the {@link Sprite} matching `id`. Depending on the sprite-sheet, this can
   * throw an error if no sprite matches that id.
   */
  public sprite(id: I): Sprite {
    return new Sprite(this.texture(id));
  }

  /**
   * Registers an animation with `name`. Non-required data is filled with fallback values.
   * Throws an error if `data.frames` does not contain at least a single frame.
   */
  public setAnimation(name: string, data: SpriteAnimationFrames): this {
    // Ensure that animation contains at least one name.
    if (data.frames.length === 0) {
      throw new Error('Animation must at least contain one frame.');
    }

    this.animations.set(name, data);

    return this;
  }

  /**
   * Returns the animation registered with the given `name`. Throws an error if no
   * animation with that name exists.
   */
  public getAnimation(name: string): SpriteAnimationFrames {
    const animation = this.animations.get(name);

    if (!animation) {
      throw new Error(`Unknown animation "${name}"`);
    }

    return animation;
  }

  /**
   * Returns `true` if an animation data with the given `name` exists on the
   * sprite sheet.
   *
   * @see SpriteAnimationFrames
   */
  public hasAnimation(name: string): boolean {
    return this.animations.has(name);
  }

  /**
   * Creates a `SpriteAnimation` component from the `SpriteAnimationFrames` matching the
   * given animation `name`. Throws an error if the animation does not exist.
   */
  public createAnimation(name: string): SpriteAnimation {
    const data = this.getAnimation(name);
    const anim = new SpriteAnimation(data.frames, data.frameDuration);

    anim.playing = name;

    return anim;
  }

}


