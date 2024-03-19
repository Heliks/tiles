import { Format, LoadType } from '@heliks/tiles-assets';
import { Texture } from 'pixi.js';


/**
 * Reads an image `Blob` and converts it to a PIXI.JS texture.
 *
 * @see Texture
 */
export class LoadTexture implements Format<Blob, Texture> {

  /** @inheritDoc */
  public readonly extensions = ['png', 'jpg', 'jpeg'];

  /** @inheritDoc */
  public readonly type = LoadType.Blob;

  /** @inheritDoc */
  public process(data: Blob): Texture {
    const image = new Image();

    image.src = URL.createObjectURL(data);

    return Texture.from(image);
  }

}




