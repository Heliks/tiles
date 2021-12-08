import { Grid, Struct } from '@heliks/tiles-engine';
import { SpriteAnimationData, SpriteSheet } from './sprite-sheet';
import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteGrid } from './sprite-grid';
import { LoadTexture } from '../../load-texture';


/** The raw data of a sprite sheet loaded from JSON. */
interface SpriteSheetData {
  cols: number;
  image: string;
  rows: number;
  spriteSize: [number, number];
  animations?: Struct<SpriteAnimationData>;
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
 * const sheet = world.get(AssetLoader).fetch('foo.json', new SpriteSheetFormat());
 * ```
 *
 * @see SpriteSheetData
 * @see SpriteSheet
 */
export class SpriteSheetFormat implements Format<SpriteSheetData, SpriteSheet> {

  /** @inheritDoc */
  public readonly name = 'PIXI:sprite-sheet';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: SpriteSheetData, file: string, loader: AssetLoader): Promise<SpriteSheet> {
    const texture = await loader.fetch(`${getDirectory(file)}/${data.image}`, new LoadTexture());

    const sheet = new SpriteGrid(
      new Grid(
        data.cols,
        data.rows,
        data.spriteSize[0],
        data.spriteSize[1]
      ),
      texture
    );

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
