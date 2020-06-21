import { Grid, Vec2 } from '@tiles/engine';
import { AnimationData } from "./sprite-animation";
import { Texture } from 'pixi.js';
import { token } from "@tiles/injector";
import { AssetStorage } from "@tiles/assets";

export class SpriteSheet extends Grid {

  /**
   * The token that is used to provide the `AssetStorage` for sprite sheets
   * to the service container.
   */
  public static readonly STORAGE = token<AssetStorage<SpriteSheet>>();

  /**
   * Contains animation data mapped to the name with which they were
   * registered.
   */
  public readonly animations = new Map<string, AnimationData>();

  /**
   * @param texture The texture from which the sprite sheet will create
   *  individual sprites.
   * @param cols The amount of columns on the sprite sheet texture.
   * @param rows The amount of rows on the sprite sheet texture.
   * @param spriteWidth The height in px of each individual sprite.
   * @param spriteHeight The width in px of each individual sprite.
   */
  constructor(
    public readonly texture: Texture,
    cols: number,
    rows: number,
    spriteWidth: number,
    spriteHeight: number
  ) {
    super(cols, rows, spriteWidth, spriteHeight);
  }

  /**
   * Registers an animation with `name`. Non-required data is filled with
   * fallback values. Throws an error if `data.frames` does not contain at
   * least a single frame.
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

  /**
   * Returns a vector containing the size of each individual sprite
   * in this sprite sheet.
   */
  public getSpriteSize(): Vec2 {
    return [
      this.cellWidth,
      this.cellHeight
    ];
  }

}

