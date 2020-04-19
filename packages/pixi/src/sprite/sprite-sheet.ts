import { Handle } from '@tiles/assets';
import { Grid, Vec2 } from '@tiles/engine';
import { AnimationData } from "./sprite-animation";
import { FlipDirection } from "../utils";

export class SpriteSheet extends Grid {

  public readonly animations = new Map<string, AnimationData>();

  constructor(
    public readonly image: Handle,
    columns: number,
    rows: number,
    cellWidth: number,
    cellHeight: number
  ) {
    super(columns, rows, cellWidth, cellHeight);
  }

  /**
   * Registers an animation with `name`. Non-required data is filled with fallback
   * values. Throws an error if `data.frames` does not contain at least a single frame.
   */
  public setAnimation(name: string, data: AnimationData): this {
    // Ensure that animation contains at least one name.
    if (!data.frames.length) {
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
