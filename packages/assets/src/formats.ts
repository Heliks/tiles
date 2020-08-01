import { Format, LoadType } from './types';

/** Reads a `Blob` and produces image nodes. */
export class ImageFormat implements Format<Blob, HTMLImageElement> {

  /** @inheritDoc */
  public readonly name = 'format:image';

  /** @inheritDoc */
  public readonly type = LoadType.Blob;

  /** @inheritDoc */
  public process(data: Blob): HTMLImageElement {
    const image = new Image();

    image.src = URL.createObjectURL(data);

    return image;
  }

}
