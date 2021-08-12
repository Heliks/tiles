import { Sprite, Texture } from 'pixi.js';
import { token } from '@heliks/tiles-engine';
import { AssetStorage } from '@heliks/tiles-assets';
import { SpriteAnimation } from '../animation';

/**
 * The token that is used to provide the `AssetStorage` for sprite sheets to the
 * service container.
 */
export const SPRITE_SHEET_STORAGE = token<AssetStorage<SpriteSheet>>();

export interface SpriteAnimationData {
  /** Contains the indexes of all sprites of which the animation consists. */
  frames: number[];
  /** Duration in ms of how long each frame is displayed. */
  frameDuration?: number;
}

/**
 * A sheet that contains multiple sprites and data associated with it
 * (e.g. animations).
 */
export abstract class SpriteSheet {

  /** @internal */
  private readonly animations = new Map<string, SpriteAnimationData>();

  /** Returns the amount of sprites contained in this sprite-sheet. */
  public abstract size(): number;

  /** Creates a new `Sprite` instance from the sprite located at `index`. */
  public abstract sprite(index: number): Sprite;

  /** Creates a new `Texture` for the sprite located at `index`. */
  public abstract texture(index: number): Texture;

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


