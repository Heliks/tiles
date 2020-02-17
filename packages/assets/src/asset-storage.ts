import { Asset, Handle } from './types';

export class AssetStorage<T> {

  /** Maps assets to their file handles. */
  protected assets = new Map<Handle, Asset<unknown>>();

  public set<T>(handle: Handle, asset: Asset<T>): this {
    this.assets.set(handle, asset);

    return this;
  }

  /** Returns the `Asset` stored under the given handle. */
  public get<T = unknown>(handle: Handle): Asset<T> {
    const asset = this.assets.get(handle) as Asset<T>;

    if (! handle) {
      throw new Error('Unknown handle');
    }

    return asset;
  }

  /** Returns `true` if an asset is stored under the given handle. */
  public has(handle: Handle): boolean {
    return this.assets.has(handle);
  }

}
