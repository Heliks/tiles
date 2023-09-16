import { AssetState } from './asset';
import { AssetStorage } from './asset-storage';
import { Handle } from './handle';
import { AssetCollectionMetadata } from './metadata';


/**
 * An asset collection holds a collection class that contains properties which are
 * automatically loaded by the asset loader. This serves as a convenient way to load
 * multiple assets at once.
 */
export class AssetCollection<C> {

  /**
   * @param storage Asset storage.
   * @param data Object with which the collection was created.
   * @param meta Collection metadata.
   */
  constructor(
    public readonly storage: AssetStorage,
    public readonly data: C,
    public readonly meta: AssetCollectionMetadata<C>
  ) {}

  /** Returns `true` if all assets in the collection have been successfully loaded. */
  public isLoaded(): boolean {
    for (const property of this.meta.properties) {
      const handle = this.data[ property.key ] as Handle;

      if (this.storage.getAsset(handle.assetId)?.state !== AssetState.Loaded) {
        return false;
      }
    }

    return true;
  }

}
