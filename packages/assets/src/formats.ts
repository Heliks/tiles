import { Type } from '@heliks/tiles-engine';
import { AssetType } from './asset';


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
 * @typeparam D Raw data that is processed to produce `R`.
 * @typeparam R Result that this format will produce from processing data `D`.
 * @typeparam L Loader that is executing this format during [[process()]].
 */
export interface Format<D, R, L = unknown> {

  /**
   * Name that uniquely identifies this format. This has no technical effects and
   * merely serves for debugging purposes.
   */
  readonly name: string;

  /**
   * Specifies how the file should be loaded. If not specified, the asset will be
   * loaded as text by default.
   *
   * @see LoadType
   */
  readonly type?: LoadType;

  /**
   * Returns the type of asset that is produced by this format. After the asset
   * processing has finished, the loader will store it in the storage appropriate
   * to this type.
   */
  getAssetType(): AssetType;

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
  public getAssetType(): Type<HTMLImageElement> {
    return HTMLImageElement;
  }

  /** @inheritDoc */
  public process(data: Blob): HTMLImageElement {
    const image = new Image();

    image.src = URL.createObjectURL(data);

    return image;
  }

}
