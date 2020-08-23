import { AssetLoader, Format, getDirectory, ImageFormat, LoadType } from '@heliks/tiles-assets';
import { SpriteGrid, SpriteSheet } from './sprite';
import { Grid, Vec2 } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';

/**
 * Reads an image `Blob` and attempts to convert it into a texture that can be used
 * in WebGL.
 */
export class TextureFormat implements Format<Blob, Texture> {

  /** @inheritDoc */
  public readonly name = 'PIXI:texture';

  /** @inheritDoc */
  public readonly type = LoadType.Blob;

  /**
   * The format we'll be using to initially load the image before converting it into a
   * texture. This is here so that a `TextureFormat` can re-use this and does not always
   * create new instances.
   */
  private static readonly imageFormat = new ImageFormat();

  /** @inheritDoc */
  public process(data: Blob): Texture {
    return Texture.from(TextureFormat.imageFormat.process(data));
  }

}

/** The raw data of a sprite sheet loaded from JSON. */
interface SpriteSheetData {
  cols: number;
  image: string;
  rows: number;
  spriteSize: Vec2;
}

/**
 * Loads a `SpriteSheet` from JSON.
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
    const texture = await loader.fetch(`${getDirectory(file)}/${data.image}`, new TextureFormat());

    console.log(
      new SpriteGrid(
        new Grid(
          data.cols,
          data.rows,
          data.spriteSize[0],
          data.spriteSize[1]
        ),
        texture
      )

    );

    return new SpriteGrid(
      new Grid(
        data.cols,
        data.rows,
        data.spriteSize[0],
        data.spriteSize[1]
      ),
      texture
    );
  }

}

/** (WIP) */
export class SpriteSheetFromTexture implements Format<Blob, SpriteSheet> {

  /** @inheritDoc */
  public readonly name = 'PIXI:sprite-sheet-from-texture';

  /** @inheritDoc */
  public readonly type = LoadType.Blob;

  constructor(
    public readonly cols: number,
    public readonly rows: number,
    public readonly spriteWidth: number,
    public readonly spriteHeight: number
  ) {}

  /** @inheritDoc */
  public process(data: Blob): SpriteSheet {
    return new SpriteGrid(
      new Grid(
        this.cols,
        this.rows,
        this.spriteWidth,
        this.spriteHeight
      ),
      new TextureFormat().process(data)
    );
  }

}

