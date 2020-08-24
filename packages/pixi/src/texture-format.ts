import { Format, ImageFormat, LoadType } from '@heliks/tiles-assets';
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




