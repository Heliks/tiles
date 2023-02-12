import { Asset } from './asset';
import { UUID } from '@heliks/tiles-engine';
import { Handle } from './handle';



/**
 * A storage for {@link Asset assets}.
 *
 * - `T`: The type of asset that is stored here.
 */
export class AssetStorage<T> {

  /** @internal */
  private readonly assets = new Map<UUID, Asset<T>>();

  /** Returns the {@link Asset} to which `handle` points to. */
  public get(handle: Handle<T>): Asset<T> | undefined {
    return this.assets.get(handle.assetId);
  }

  /**
   * Returns the {@link Asset} to which `handle` points to. Throws an error if it does
   * not point to any asset.
   */
  public resolve(handle: Handle<T>): Asset<T> {
    const asset = this.get(handle);

    if (! asset) {
      throw new Error(`Invalid asset: ${handle.assetId}`);
    }

    return asset;
  }

  /** Returns `true` if an asset is stored under the given handle. */
  public has(handle: Handle<T>): boolean {
    return this.assets.has(handle.assetId);
  }

  /** Stores `asset` under `handle`. */
  public set(asset: Asset<T>): this {
    this.assets.set(asset.id, asset);

    return this;
  }

}
