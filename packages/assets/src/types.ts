import { AssetStorage } from "./asset-storage";

/** A unique pointer to an asset. */
export type Handle<T = unknown> = symbol;

/** Possible ways to load an asset. */
export enum LoadType {
  ArrayBuffer,
  Blob,
  Json,
  Text
}

/**
 * @typeparam F The format that this loader is using to process raw asset data.
 */
export interface Loader<F> {

  /**
   * Loads a file. Similarly to [[load()]] this function will return a file
   * handle, but only after the asset has finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the loaded asset should be stored.
   */
  async(
    path: string,
    format: F,
    storage: AssetStorage<unknown>
  ): Promise<Handle<unknown>>;

  /** Fetches the contents of `file` using `format.` */
  fetch<D, R>(file: string, format: Format<D, R>): Promise<R>;

  /**
   * Loads a file. Instantly returns a file handle that can be used to access
   * the asset in storage as soon as it completes loading.
   *
   * Note: The asset is only available after it finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the loaded asset should be stored.
   */
  load(
    path: string,
    format: F,
    storage: AssetStorage<unknown>
  ): Handle<unknown>;

}

/**
 * An asset format.
 *
 * @typeparam D The raw data that is processed to produce `T`.
 * @typeparam R The result that this format will produce from processing data `R`.
 */
export interface Format<D, R> {

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
   */
  process(data: D, loader: Loader<Format<unknown, unknown>>): Promise<R> | R;

}

/**
 * A loaded asset
 *
 * @typeparam T The processed data produced by the format that loaded this asset.
 */
export interface Asset<T> {
  /**
   * The assets processed data.
   */
  readonly data: T;
  /**
   * The name of the asset type. Will be inherited from the `Format` that
   * processed this asset.
   */
  readonly name: string;
}

