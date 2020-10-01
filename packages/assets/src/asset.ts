/** A unique pointer to an asset. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Handle<T = unknown> = symbol;

/**
 * A loaded asset
 *
 * @typeparam T Asset data.
 */
export interface Asset<T> {
  /** The assets processed data. */
  readonly data: T;
  /**
   * The name of the asset type. Will be inherited from the `Format` that processed
   * this asset.
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

