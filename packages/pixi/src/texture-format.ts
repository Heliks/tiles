import { Format, ImageFormat, LoadType } from '@tiles/assets';
import { Texture } from 'pixi.js';

/** Reads a `Blob` and produces image nodes. */
export class TextureFormat implements Format<Texture, Blob> {

  /** {@inheritDoc} */
  public readonly name = 'PIXI:texture';

  /** {@inheritDoc} */
  public readonly type = LoadType.Blob;

  /** {@inheritDoc} */
  public process(data: Blob): Texture {
    // Todo: always creating a new image format instance is probably a bad idea.
    return Texture.from(new ImageFormat().process(data));
  }

}
