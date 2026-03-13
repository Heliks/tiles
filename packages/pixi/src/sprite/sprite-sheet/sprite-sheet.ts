import { Rectangle, Vec2 } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { SpriteAnimation } from '../animation';


export interface SpriteAnimationFrames {
  /** Contains the indexes of all sprites of which the animation consists. */
  frames: number[];
  /** Duration in ms of how long each frame is displayed. */
  frameDuration?: number;
}

/** Valid types for a sprite ID. */
export type SpriteId = number | string;

/** Unique ID of a sprite slice. */
export type SliceId = number | string;

/**
 * Base class for managing spritesheets.
 *
 * ## Slices
 *
 * Slices are rectangular regions that are cut from the spritesheets' source texture
 * as individual textures.
 *
 * @example
 * ```ts
 *  // Define a 25x25px slice.
 *  spritesheet.setSliceRegion('foo', new Rectangle(0, 0, 25, 25));
 *
 *  // Create the texture for the "foo" slice.
 *  const texture = spritesheet.slice('foo');
 * ```
 */
export abstract class SpriteSheet<I extends SpriteId = SpriteId> {

  /** Contains the spritesheet source texture. */
  public abstract readonly source: PIXI.Texture;

  /** Contains the spritesheet animation frames. */
  public readonly animations = new Map<string, SpriteAnimationFrames>();

  /** Contains the spritesheets slices. */
  public readonly slices = new Map<SliceId, Rectangle>();

  /** @internal */
  private readonly cache = new Map<I, PIXI.Texture>();

  /** Returns the total number of sprites. */
  public abstract size(): number;

  /**
   * Returns the size of the sprite matching `id`. Throws an error if `id` does not
   * match any sprites.
   */
  public abstract getSpriteSize(id: I): Vec2;

  /** Internal implementation of the spritesheet {@link Texture} factory. */
  protected abstract _texture(id: I): PIXI.Texture;

  /**
   * Creates a {@link Texture} from the sprite matching `id`. Depending on the sprite -
   * sheet, this can throw an error if no sprite matches that id.
   */
  public texture(id: I): PIXI.Texture {
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
  public sprite(id: I): PIXI.Sprite {
    return new PIXI.Sprite(this.texture(id));
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

    if (! animation) {
      const names = Array.from(this.animations.keys())
        .sort()
        .map(name => `- ${name}`)
        .join('\n');

      console.error(`Available animations:\n\n${names}`);

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

  /** Adds a new slice region. Throws if a slice with that ID already exists. */
  public setSliceRegion(id: SliceId, region: Rectangle): this {
    if (this.slices.has(id)) {
      throw new Error(`Slice ${id} already exists.`);
    }

    this.slices.set(id, region);

    return this;
  }

  /** Returns a slice region. Throws if a slice with that ID already exists. */
  public getSliceRegion(id: SliceId): Rectangle {
    const slice = this.slices.get(id);

    if (! slice) {
      throw new Error(`Invalid slice ${id}`);
    }

    return slice;
  }

  /** Creates the slice matching `id`. */
  public slice(id: SliceId): PIXI.Texture {
    const slice = this.getSliceRegion(id);

    return new PIXI.Texture(this.source.baseTexture, new PIXI.Rectangle(
      slice.x,
      slice.y,
      slice.width,
      slice.height
    ));
  }

}
