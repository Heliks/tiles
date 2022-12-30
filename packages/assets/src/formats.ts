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
 * A format for an asset type.
 *
 * Objects that implement this interface are used by the asset loader to load a specific
 * asset type into its appropriate asset storage.
 *
 * - `D`: Raw data that is processed to produce result `R`.
 * - `R`: Result that this format will produce from processing data `D`.
 * - `L`: Loader that will be executing this format.
 */
export interface Format<D, R, L = unknown> {

  /**
   * Contains a list of file extensions that are supported by this format. The extensions
   * must be without a preceding dot.
   */
  readonly extensions: string[];

  /**
   * Determines how the contents of the file should be loaded. If not specified, the
   * asset will be loaded as `Text` by default.
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
  public readonly extensions = ['png', 'jpg', 'jpeg'];

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
