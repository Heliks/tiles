import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Rectangle } from '@heliks/tiles-engine';
import { Rectangle as PxRect, Texture } from 'pixi.js';
import { PackedSpriteSheet } from './packed-sprite-sheet';
import { SpriteGrid } from './sprite-grid';
import { SliceId, SpriteAnimationFrames, SpriteSheet } from './sprite-sheet';


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

  /**
   * Width of each sprite in px.
   *
   * If both this and {@link spriteHeight} are defined, the resulting spritesheet
   * will be a {@link SpriteGrid}.
   */
  spriteWidth?: number;

  /**
   * Height of each sprite in px.
   *
   * If both this and {@link spriteWidth} are defined, the resulting spritesheet
   * will be a {@link SpriteGrid}.
   */
  spriteHeight?: number;

}

function parseSpritesheetSlices(spritesheet: SpriteSheet, data: SpriteSheetData): void {
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
}

function parseSpritesheetAnimations(spritesheet: SpriteSheet, data: SpriteSheetData): void {
  if (data.animations) {
    for (const name in data.animations) {
      if (data.animations.hasOwnProperty(name)) {
        spritesheet.setAnimation(name, data.animations[name]);
      }
    }
  }
}

/**
 * Asset loader format for loading {@link SpriteSheet sprite-sheets}.
 *
 * Loaded extensions are:
 *  - `.spritesheet`
 *  - `.spritesheet.json`
 */
export class LoadSpriteSheet implements Format<SpriteSheetData, SpriteSheet> {

  /** @inheritDoc */
  public readonly extensions = ['spritesheet', 'spritesheet.json'];

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /**
   * Creates a {@link PackedSpriteSheet} from the given spritesheet `data`.
   *
   * @param texture Spritesheet texture.
   * @param data Spritesheet data.
   */
  public packed(texture: Texture, data: SpriteSheetData): PackedSpriteSheet {
    const spritesheet = new PackedSpriteSheet(texture);

    parseSpritesheetAnimations(spritesheet, data);
    parseSpritesheetSlices(spritesheet, data);

    for (const [id, region] of spritesheet.slices) {
      spritesheet.setPackedSprite(id, {
        region: new PxRect(
          region.x,
          region.y,
          region.width,
          region.height
        )
      });
    }

    return spritesheet;
  }

  /**
   * Creates a {@link SpriteGrid} from the given spritesheet `data`.
   *
   * @param texture Spritesheet texture.
   * @param file File path to the spritesheet texture.
   * @param sw Sprite width in px.
   * @param sh Sprite height in px.
   * @param data Spritesheet data.
   */
  public grid(texture: Texture, file: string, sw: number, sh: number, data: SpriteSheetData): SpriteGrid {
    const gw = Math.floor(data.imageWidth / sw);
    const gh = Math.floor(data.imageHeight / sh);

    const spritesheet = new SpriteGrid(new Grid(gw, gh, sw, sh), texture, file);

    parseSpritesheetAnimations(spritesheet, data);
    parseSpritesheetSlices(spritesheet, data);

    return spritesheet;
  }

  /** @inheritDoc */
  public async process(data: SpriteSheetData, file: string, loader: AssetLoader): Promise<SpriteSheet> {
    const texturePath = getDirectory(file, data.image);
    const texture = await loader.fetch<Texture>(texturePath);

    if (data.spriteWidth && data.spriteHeight) {
      return this.grid(
        texture,
        texturePath,
        data.spriteWidth,
        data.spriteHeight,
        data
      );
    }

    return this.packed(texture, data);
  }

}
