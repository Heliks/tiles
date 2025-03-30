import { TypeId } from '@heliks/tiles-engine';
import { Asset } from './asset';
import { Handle } from './handle';


/**
 * A storage for {@link Asset assets}.
 *
 * - `T`: The type of asset that is stored here.
 */
export class AssetStorage {

  /** @internal */
  private readonly _assets = new Map<TypeId, Asset>();

  /** Returns the {@link Asset asset} that is stored under `id`. */
  public getAsset<T>(id: TypeId): Asset<T> | undefined {
    return this._assets.get(id) as Asset<T>;
  }

  /** Returns the {@link Asset} to which `handle` points to. */
  public get<T>(handle: Handle<T>): T | undefined {
    return this._assets.get(handle.assetId)?.data as T;
  }

  /**
   * Returns the {@link Asset} to which `handle` points to. Throws an error if it does
   * not point to any asset.
   */
  public resolve<T>(handle: Handle<T>): T {
    const data = this.get<T>(handle);

    if (! data) {
      throw new Error(`Invalid asset: ${handle.assetId}`);
    }

    return data;
  }

  /** Returns `true` if an asset is stored under the given handle. */
  public has(handle: Handle): boolean {
    return this._assets.has(handle.assetId);
  }

  /** Stores `asset` under `handle`. */
  public set(asset: Asset): this {
    this._assets.set(asset.id, asset);

    return this;
  }

}
