import { Handle, LoadingState } from './handle';
import { AssetCollectionMetadata } from './metadata';


/**
 * An asset collection holds a collection class that contains properties which are
 * automatically loaded by the asset loader. This serves as a convenient way to load
 * multiple assets at once.
 */
export class AssetCollection<C> {

  /**
   * @param data Object with which the collection was created.
   * @param meta Collection metadata.
   */
  constructor(
    public readonly data: C,
    public readonly meta: AssetCollectionMetadata<C>
  ) {}

  /** Returns `true` if all assets in the collection have been successfully loaded. */
  public isLoaded(): boolean {
    for (const property of this.meta.properties) {
      const handle = this.data[ property.key ] as Handle;

      if (handle.state !== LoadingState.Loaded) {
        return false;
      }
    }

    return true;
  }

}
