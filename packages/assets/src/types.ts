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
   * @param loader Instance of the loader that was used to load the asset. Can
   *  be used to load additional stuff.
   * @returns The formatted data. Either as a promise or directly.
   */
  process(data: D, file: string, loader: L): Promise<R> | R;

}

/**
 * A loaded asset
 *
 * @typeparam T Asset data.
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

/**
 * A storage for assets.
 *
 * @typeparam T The kind of data of each asset in this storage.
 */
export interface AssetStorage<T> {
  /** Returns the `Asset` stored under the given handle. */
  get(handle: Handle<T>): Asset<T> | undefined;
  /** Returns `true` if an asset is stored under the given handle. */
  has(handle: Handle<T>): boolean;
  /** Stores `asset` under `handle`. */
  set(handle: Handle<T>, asset: Asset<T>): this;
}

