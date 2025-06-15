import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Rectangle, Struct } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { SpriteGrid } from './sprite-grid';
import { SpriteAnimationFrames, SpriteSheet } from './sprite-sheet';
import { SliceId, SpriteSlices } from './sprite-slices';


/** @internal */
interface BaseSpriteSheetData {
  animations?: Struct<SpriteAnimationFrames>;
  image: string;
  imageWidth: number;
  imageHeight: number;
}

/** Raw data for {@link SpriteGrid} {@link SpriteSheet spritesheets}. */
 interface SpriteGridData extends BaseSpriteSheetData {
  spriteWidth: number;
  spriteHeight: number;
  type?: 'grid';
}

/** @internal */
interface SpriteSlicesConfig {
  [id: SliceId]: {
    w: number;
    h: number;
    x: number;
    y: number;
  }
}

/** Raw data for {@link SpriteSlices} {@link SpriteSheet spritesheets}. */
interface SpriteSlicesData extends BaseSpriteSheetData {
  slices: SpriteSlicesConfig;
  type: 'slices';
}

/** Raw data for sprite sheets. */
type SpriteSheetData = SpriteSlicesData | SpriteGridData;

/** @internal */
function _grid(texture: Texture, texturePath: string, data: SpriteGridData): SpriteGrid {
  const grid = new Grid(
    Math.floor(data.imageWidth / data.spriteWidth),
    Math.floor(data.imageHeight / data.spriteHeight),
    data.spriteWidth,
    data.spriteHeight
  );

  return new SpriteGrid(grid, texture, texturePath);
}

/** @internal */
function _slices(texture: Texture, texturePath: string, data: SpriteSlicesData): SpriteSlices {
  const spritesheet = new SpriteSlices(texture, texturePath);

  for (const id in data.slices) {
    const slice = data.slices[id];

    spritesheet.setSliceRegion(id, new Rectangle(
      slice.w,
      slice.h,
      slice.x,
      slice.y
    ));
  }

  return spritesheet;
}


/**
 * Loads {@link Spritesheet spritesheets} from `.spritesheet` & `.spritesheet.json` files.
 *
 * ### Load sprite grids
 *
 * See: {@link SpriteGrid}
 *
 * ```json
 *  {
 *    "image": 'foo.png'
 *    "imageWidth": 100,
 *    "imageHeight": 100,
 *    "spriteWidth": 10,
 *    "spriteWidth": 10
 *  }
 * ```
 *
 * ### Load slice-able texture
 *
 * See {@link SpriteSlices}
 *
 * ```json
 *  {
 *    "type": "slices",
 *    "image": 'foo.png'
 *    "imageWidth": 100,
 *    "imageHeight": 100,
 *    "slices": {
 *      "foo": { w: 10, h: 10, x: 0, y: 0 },
 *      "bar": { w: 10, h: 10, x: 10, y: 0 }
 *    }
 *  }
 * ```
 * ```
 */
export class LoadSpriteSheet implements Format<SpriteSheetData, SpriteSheet> {

  /** @inheritDoc */
  public readonly extensions = ['spritesheet', 'spritesheet.json'];

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: SpriteGridData, file: string, loader: AssetLoader): Promise<SpriteGrid>;

  /** @inheritDoc */
  public async process(data: SpriteSlicesData, file: string, loader: AssetLoader): Promise<SpriteSlices>;

  /** @inheritDoc */
  public async process(data: SpriteSheetData, file: string, loader: AssetLoader): Promise<SpriteSheet> {
    const texturePath = getDirectory(file, data.image);
    const texture = await loader.fetch<Texture>(texturePath);

    const spritesheet = data.type === 'slices'
      ? _slices(texture, texturePath, data)
      : _grid(texture, texturePath, data);

    if (data.animations) {
      for (const name in data.animations) {
        if (data.animations.hasOwnProperty(name)) {
          spritesheet.setAnimation(name, data.animations[name]);
        }
      }
    }

    return spritesheet;
  }

}
