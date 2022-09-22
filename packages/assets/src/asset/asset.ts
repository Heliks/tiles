import { AbstractType, Type } from '@heliks/tiles-engine';

export enum LoadingState {
  /** Asset is currently loading. */
  Loading,
  /** Asset is fully loaded and can be used. */
  Loaded
}

/** A unique pointer to an asset. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Handle<T = unknown> {

  /** Contains the loading state of the asset to which this handle points to. */
  public state = LoadingState.Loading;

  /**
   * @param path Path of the asset file that this handle points to.
   */
  constructor(public readonly path: string) {}

}

/**
 * Represents an asset type. This can be any kind of arbitrary class symbol as long as
 * it uniquely correlates to a specific type of asset. The loader will use this symbol
 * as key to store the storage for assets of that type.
 *
 * For example, a renderer most likely wants to load textures. We can simply define this
 * as `AssetType<Texture>`, where `Texture` will be used as the key to access the storage
 * for that asset type.
 */
export type AssetType<T = unknown> = AbstractType<T> | Type<T>;

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
