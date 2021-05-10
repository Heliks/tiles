import { SpriteSheet } from './sprite-sheet';
import { Rectangle } from '@heliks/tiles-engine';
import { Rectangle as PxRectangle, Sprite, Texture } from 'pixi.js';
import { Frame } from './frame';

/** A sprite sheet that consists of multiple individual, different sized sprite frames. */
export class SpriteCollection extends SpriteSheet {

  /** @internal */
  private readonly frames = new Map<number, Frame>();

  /** Cache for created textures. */
  private readonly textures = new Map<number, Texture>()

  /**
   * @param tex Texture from which individual sprites will be created.
   */
  constructor(private readonly tex: Texture) {
    super();
  }

  /** Sets a `frame` at `index`. */
  public setFrame(index: number, frame: Frame): this {
    this.frames.set(index, frame);

    return this;
  }

  /** @internal */
  private _getFrame(index: number): Frame {
    const frame = this.frames.get(index);

    if (!frame) {
      throw new Error(`Unknown frame: "${index}"`);
    }

    return frame;
  }

  /** Returns the frame for the sprite at `index`. */
  public getFrame(index: number): Rectangle {
    const frame = this._getFrame(index);

    return new Rectangle(
      frame.width,
      frame.height,
      frame.x,
      frame.y
    );
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
    let texture = this.textures.get(index);

    if (texture) {
      return texture;
    }

    // Todo: getFrame is a hard error which makes this inconsistent with how sprite
    //  grids work. Maybe an empty frame should be used here instead?
    const frame = this._getFrame(index);

    texture = new Texture(
      this.tex.baseTexture,
      frame,
      new PxRectangle(
        0,
        0,
        frame.source.width,
        frame.source.height
      ),
      new PxRectangle(
        frame.source.x,
        frame.source.y,
        frame.width,
        frame.height
      )
    );

    this.textures.set(index, texture);

    return texture;
  }

}
