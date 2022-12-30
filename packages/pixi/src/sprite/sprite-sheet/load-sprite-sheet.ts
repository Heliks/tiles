import { Grid, Struct } from '@heliks/tiles-engine';
import { SpriteAnimationData, SpriteSheet } from './sprite-sheet';
import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteGrid } from './sprite-grid';
import { LoadTexture } from '../../load-texture';


/** The raw data of a sprite sheet loaded from JSON. */
interface SpriteSheetData {
  animations?: Struct<SpriteAnimationData>;
  image: string;
  imageWidth: number;
  imageHeight: number;
  spriteWidth: number;
  spriteHeight: number;
}

/** @internal */
function createSpritesheetGrid(data: SpriteSheetData): Grid {
  return new Grid(
    Math.floor(data.imageWidth / data.spriteWidth),
    Math.floor(data.imageHeight / data.spriteHeight),
    data.spriteWidth,
    data.spriteHeight
  );
}

/**
 * Loads a `SpriteSheet` from a JSON format.
 *
 * ```json
 * {
 *    "cols": 1,
 *    "image":
 *    "rows": 2,
 *    "spriteSize": [16, 16]
 * }
 * ```
 * To load the sprite sheet:
 *
 * ```ts
 * const sheet = world.get(AssetLoader).fetch('foo.json', new LoadSpriteSheet());
 * ```
 *
 * @see SpriteSheetData
 * @see SpriteSheet
 */
export class LoadSpriteSheet implements Format<SpriteSheetData, SpriteSheet> {

  /** @inheritDoc */
  public readonly extensions = ['spritesheet', 'spritesheet.json'];

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public getAssetType(): typeof SpriteSheet {
    return SpriteSheet;
  }

  /** @inheritDoc */
  public async process(data: SpriteSheetData, file: string, loader: AssetLoader): Promise<SpriteSheet> {
    const texture = await loader.fetch(getDirectory(file, data.image), new LoadTexture());
    const sheet = new SpriteGrid(createSpritesheetGrid(data), texture);

    if (data.animations) {
      for (const name in data.animations) {
        if (data.animations.hasOwnProperty(name)) {
          sheet.setAnimation(name, data.animations[name]);
        }
      }
    }

    return sheet;
  }

}
