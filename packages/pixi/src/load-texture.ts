import { Format, ImageFormat, LoadType } from '@heliks/tiles-assets';
import { Texture } from 'pixi.js';

/**
 * Reads an image `Blob` and converts it to a PIXI.JS texture.
 *
 * @see Texture
 */
export class LoadTexture implements Format<Blob, Texture> {

  /** @inheritDoc */
  public readonly name = 'PIXI:texture';

  /** @inheritDoc */
  public readonly type = LoadType.Blob;

  /** Cached format used to load the image before it is converted into a texture. */
  private static readonly imageFormat = new ImageFormat();

  /** @inheritDoc */
  public process(data: Blob): Texture {
    return Texture.from(LoadTexture.imageFormat.process(data));
  }

}




