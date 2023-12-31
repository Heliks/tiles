import { Grid, Vec2 } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { cropTexture } from '../../utils';
import { SpriteSheet } from './sprite-sheet';


/**
 * A {@link SpriteSheet} that arranges sprites in a grid on a source texture. The ID of
 * each individual sprite is equivalent to the index of the grid cell that it occupies.
 *
 * The size of each sprite in the grid has the same size. For spritesheets that require
 * inconsistent sprite sizes, a {@link SpriteSlices} spritesheet can be used.
 */
export class SpriteGrid extends SpriteSheet<number> {

  /**
   * @param grid Grid layer for the sprite sheet.
   * @param source Source texture from which sprite textures will be created.
   */
  constructor(public readonly grid: Grid, public readonly source: Texture) {
    super();
  }

  /** @inheritDoc */
  public size(): number {
    return this.grid.size;
  }

  /** @inheritDoc */
  protected _texture(index: number): Texture {
    return cropTexture(
      this.source,
      this.grid.getPosition(index),
      this.getSpriteSize()
    );
  }

  /** @inheritDoc */
  public getSpriteSize(): Vec2 {
    return new Vec2(this.grid.cellWidth, this.grid.cellHeight);
  }

}
