import { Asset, Handle } from './types';

export class AssetStorage<T> {

  /** Maps assets to their file handles. */
  protected assets = new Map<Handle<T>, Asset<T>>();

  /** Stores `asset` under `handle`. */
  public set(handle: Handle<T>, asset: Asset<T>): this {
    this.assets.set(handle, asset);

    return this;
  }

  /** Returns the `Asset` stored under the given handle. */
  public get(handle: Handle<T>): Asset<T> | undefined {
    return this.assets.get(handle);
  }

  /** Returns `true` if an asset is stored under the given handle. */
  public has(handle: Handle<T>): boolean {
    return this.assets.has(handle);
  }

}
