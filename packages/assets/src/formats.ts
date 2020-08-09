/** Possible ways to load an asset. */
export enum LoadType {
  ArrayBuffer,
  Blob,
  Json,
  Text
}

/**
 * An asset format.
 *
 * @typeparam D Raw data that is processed to produce `T`.
 * @typeparam R Result that this format will produce from processing data `R`.
 * @typeparam L Loader that is executing this format during [[process()]].
 */
export interface Format<D, R, L = unknown> {

  /**
   * Will be passed down to all assets that are loaded with this format.
   */
  readonly name: string;

  /**
   * Returns the `LoadType` of an asset. If this is not specified the asset will
   * be loaded with `Text` by default.
   */
  readonly type?: LoadType;

  /**
   * Reads the given `data` and produces asset data `R`.
   *
   * @param data Raw data that should be processed by this format.
   * @param file Path of the file from which `data` was loaded.
   * @param loader Instance of the loader that was used to load the asset. Can be used
   *  to load additional stuff.
   * @returns The formatted data. Either as a promise or directly.
   */
  process(data: D, file: string, loader: L): Promise<R> | R;

}

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
