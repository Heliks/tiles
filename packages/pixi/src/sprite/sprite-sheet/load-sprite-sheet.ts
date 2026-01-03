import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Rectangle } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { SpriteGrid } from './sprite-grid';
import { SliceId, SpriteAnimationFrames } from './sprite-sheet';


/** @internal */
interface SpriteSheetSliceData {
  [id: SliceId]: {
    w: number;
    h: number;
    x: number;
    y: number;
  }
}

/** @internal */
interface SpriteSheetAnimationData {
  [name: string]: SpriteAnimationFrames;
}

/**
 * Defines the file format for spritesheets.
 */
export interface SpriteSheetData {
  animations?: SpriteSheetAnimationData;

  /** Path to the source image. Relative to the spritesheet. */
  image: string;

  /** Width of the source image in px. */
  imageWidth: number;

  /** Height of the source image in px. */
  imageHeight: number;

  /**
   * Defines specific regions that can be cut from the spritesheet as individual sprite
   * or texture.
   */
  slices?: SpriteSheetSliceData;

  /** Width of each sprite on the sheet in px. */
  spriteWidth?: number;

  /** Height of each sprite on the sheet in px. */
  spriteHeight?: number;

}

/**
 * Asset loader format for loading {@link SpriteSheet sprite-sheets}.
 *
 * Loaded extensions are:
 *  - `.spritesheet`
 *  - `.spritesheet.json`
 */
export class LoadSpriteSheet implements Format<SpriteSheetData, SpriteGrid> {

  /** @inheritDoc */
  public readonly extensions = ['spritesheet', 'spritesheet.json'];

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: SpriteSheetData, file: string, loader: AssetLoader): Promise<SpriteGrid> {
    const texturePath = getDirectory(file, data.image);
    const texture = await loader.fetch<Texture>(texturePath);

    const sw = data.spriteWidth ?? data.imageWidth;
    const sh = data.spriteHeight ?? data.imageHeight;

    const grid = new Grid(
      Math.floor(data.imageWidth / sw),
      Math.floor(data.imageHeight / sh),
      sw,
      sh
    );

    const spritesheet = new SpriteGrid(grid, texture, texturePath);

    if (data.animations) {
      for (const name in data.animations) {
        if (data.animations.hasOwnProperty(name)) {
          spritesheet.setAnimation(name, data.animations[name]);
        }
      }
    }

    if (data.slices) {
      for (const id in data.slices) {
        const slice = data.slices[id];

        spritesheet.setSliceRegion(id, new Rectangle(
          slice.w,
          slice.h,
          slice.x,
          slice.y
        ));
      }
    }

    return spritesheet;
  }

}
