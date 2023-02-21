import { Vec2 } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { SpriteAnimation } from '../animation';


export interface SpriteAnimationData {
  /** Contains the indexes of all sprites of which the animation consists. */
  frames: number[];
  /** Duration in ms of how long each frame is displayed. */
  frameDuration?: number;
}

/** A collection of sprites. */
export abstract class SpriteSheet {

  /** @internal */
  private readonly animations = new Map<string, SpriteAnimationData>();

  /** Returns the total amount of sprites in this spritesheet. */
  public abstract size(): number;

  /** Creates a sprite {@link Texture texture}. */
  public abstract texture(index: number): Texture;

  /** Creates a {@link Sprite}. */
  public abstract sprite(index: number): Sprite;

  /** Returns the size of a sprite in pixels. */
  public abstract getSpriteSize(spriteId: number): Vec2;

  /**
   * Registers an animation with `name`. Non-required data is filled with fallback values.
   * Throws an error if `data.frames` does not contain at least a single frame.
   */
  public setAnimation(name: string, data: SpriteAnimationData): this {
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
  public getAnimation(name: string): SpriteAnimationData {
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
   * @see SpriteAnimationData
   */
  public hasAnimation(name: string): boolean {
    return this.animations.has(name);
  }

  /**
   * Creates a `SpriteAnimation` component from the `SpriteAnimationData` matching the
   * given animation `name`. Throws an error if the animation does not exist.
   */
  public createAnimation(name: string): SpriteAnimation {
    const data = this.getAnimation(name);
    const anim = new SpriteAnimation(data.frames, data.frameDuration);

    anim.playing = name;

    return anim;
  }

}


