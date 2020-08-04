import { Grid, Vec2 } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { cropTexture } from '../utils';
import { SpriteSheet } from './sprite-sheet';

/** A sprite-sheet that sorts individuals sprites on a grid. */
export class SpriteGrid extends SpriteSheet {

  /**
   * @param grid Grid layer for the sprite sheet.
   * @param _texture Texture from which the sprites will be created.
   */
  constructor(
    protected readonly grid: Grid,
    protected readonly _texture: Texture
  ) {
    super();
  }

  /** @inheritDoc */
  public size(): number {
    return this.grid.size;
  }

  /** @inheritDoc */
  public texture(index: number): Texture {
    return cropTexture(
      this._texture,
      this.grid.pos(index),
      this.getSpriteSize()
    );
  }

  /** @inheritDoc */
  public sprite(index: number): Sprite {
    return new Sprite(this.texture(index));
  }

  /** Returns a vector of the size of each individual sprite in this sprite sheet. */
  public getSpriteSize(): Vec2 {
    return [
      this.grid.cellWidth,
      this.grid.cellHeight
    ];
  }

}
