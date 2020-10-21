import { SpriteSheet } from './sprite-sheet';
import { Rectangle } from '@heliks/tiles-engine';
import { Sprite, Texture, Rectangle as PxRectangle } from 'pixi.js';

/** A sprite sheet that consists of multiple individual, different sized sprite frames. */
export class SpriteCollection extends SpriteSheet {

  /** @internal */
  private readonly frames = new Map<number, PxRectangle>();

  /**
   * @param tex Texture from which individual sprites will be created.
   */
  constructor(private readonly tex: Texture) {
    super();
  }

  /** Sets a `frame` at `index`. */
  public setFrame(index: number, x: number, y: number, width: number, height: number): this {
    this.frames.set(index, new PxRectangle(x, y, width, height));

    return this;
  }

  /** @internal */
  private _getFrame(index: number): PxRectangle {
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
    // Todo: getFrame is a hard error which makes this inconsistent with how sprite grids
    //  work. Maybe an empty frame should be used here instead?
    return new Texture(this.tex.baseTexture, this._getFrame(index));
  }



}
