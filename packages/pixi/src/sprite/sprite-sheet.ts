import { Sprite, Texture } from 'pixi.js';
import { token } from '@heliks/tiles-engine';
import { AssetStorage } from '@heliks/tiles-assets';
import { FlipMode } from './flip';
import { SpriteAnimation } from './components';

/**
 * The token that is used to provide the `AssetStorage` for sprite sheets to the
 * service container.
 */
export const SPRITE_SHEET_STORAGE = token<AssetStorage<SpriteSheet>>();

export interface SpriteAnimationData {
  /** Direction in which the sprites of this animation should be flipped. */
  flip?: FlipMode;
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

  /** Returns the animation registered with the given `name`. */
  public getAnimation(name: string): SpriteAnimationData | undefined {
    return this.animations.get(name);
  }

  public createAnimation(name: string, animation = new SpriteAnimation()): SpriteAnimation {
    const data = this.getAnimation(name);

    if (!data) {
      throw new Error(`Unknown animation "${name}"`);
    }

    // Reset the animation. This is in case a previously used SpriteAnimation instance
    // was provided for re-use.
    animation.reset();
    animation.playing = name;

    // Assign animation data to sprite animation.
    animation.frames = [...data.frames];

    if (data.frameDuration) {
      animation.frameDuration = data.frameDuration;
    }

    // Assign flip mode if set.
    if (data.flip) {
      animation.flipMode = data.flip;
    }

    return animation;
  }

}


