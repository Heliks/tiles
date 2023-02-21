import { Grid, Vec2 } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { cropTexture } from '../../utils';
import { SpriteSheet } from './sprite-sheet';


/**
 * A {@link SpriteSheet spritesheet} where sprites are arranged in a grid. The ID of each
 * sprite is equivalent to the index of the cell it occupies.
 */
export class SpriteGrid extends SpriteSheet {

  /**
   * @param grid Grid layer for the sprite sheet.
   * @param _texture Texture from which the sprites will be created.
   */
  constructor(public readonly grid: Grid, public readonly _texture: Texture) {
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
      this.grid.getPosition(index),
      this.getSpriteSize()
    );
  }

  /** @inheritDoc */
  public sprite(index: number): Sprite {
    return new Sprite(this.texture(index));
  }

  /** @inheritDoc */
  public getSpriteSize(): Vec2 {
    return new Vec2(this.grid.cellWidth, this.grid.cellHeight);
  }

}
