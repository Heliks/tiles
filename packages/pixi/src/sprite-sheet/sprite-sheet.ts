import { Sprite, Texture } from 'pixi.js';
import { token } from '@heliks/tiles-engine';
import { AssetStorage } from '@heliks/tiles-assets';
import { FlipDirection } from '../utils';

export interface AnimationData {
  /** The direction in which the sprites of all frames should be flipped. */
  flip?: FlipDirection;
  /** Contains the indexes of all sprites of which the animation consists. */
  frames: number[];
  /**
   * Duration in milliseconds how long each frame is visible before the animation
   * switches to the next one.
   */
  frameDuration?: number;
}

/**
 * The token that is used to provide the `AssetStorage` for sprite sheets to the
 * service container.
 */
export const SPRITE_SHEET_STORAGE = token<AssetStorage<SpriteSheet>>();

/**  */
export abstract class SpriteSheet {

  /** @internal */
  private readonly animations = new Map<string, AnimationData>();

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
  public setAnimation(name: string, data: AnimationData): this {
    // Ensure that animation contains at least one name.
    if (data.frames.length === 0) {
      throw new Error('Animation must at least contain one frame.');
    }

    this.animations.set(name, data);

    return this;
  }

  /** Returns the animation registered with the given `name`. */
  public getAnimation(name: string): AnimationData | undefined {
    return this.animations.get(name);
  }

}

