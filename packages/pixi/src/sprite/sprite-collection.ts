import { SpriteSheet } from './sprite-sheet';
import { Rectangle } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { cropTexture } from '../utils';

/** A sprite sheet that consists of multiple individual, different sized sprite frames. */
export class SpriteCollection extends SpriteSheet {

  /** @internal */
  private readonly frames = new Map<number, Rectangle>();

  /**
   * @param tex Texture from which individual sprites will be created.
   */
  constructor(private readonly tex: Texture) {
    super();
  }

  /** Sets a `frame` at `index`. */
  public setFrame(index: number, frame: Rectangle): this {
    this.frames.set(index, frame);

    return this;
  }

  /** Returns the frame for the sprite at `index`. */
  public getFrame(index: number): Rectangle {
    const frame = this.frames.get(index);

    if (!frame) {
      throw new Error(`Unknown frame: "${index}"`);
    }

    return frame;
  }

  /** @inheritDoc */
  public size(): number {
    return this.frames.size;
  }

  /** @inheritDoc */
  public sprite(index: number): Sprite {
    return new Sprite(this.texture(index));
  }

  /** @inheritDoc */
  public texture(index: number): Texture {
    // Todo: getFrame is a hard error which makes this inconsistent with how sprite grids
    //  work. Maybe an empty frame should be used here instead?
    const frame = this.getFrame(index);

    return cropTexture(this.tex, [
      frame.x,
      frame.y
    ], [
      frame.width,
      frame.height
    ]);
  }



}
