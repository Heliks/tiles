import { AbstractType, Type, UUID } from '@heliks/tiles-engine';
import { Handle } from './handle';


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
 * A loaded asset.
 *
 * - `T`: Asset type.
 */
export class Asset<T> {

  /**
   * @param id: Unique asset identifier.
   * @param file Path to the source file from which the asset was loaded.
   * @param data Contains the processed asset data.
   */
  constructor(
    public readonly id: UUID,
    public readonly file: string,
    public readonly data: T
  ) {}

  /**
   * Creates a new {@link Handle} that can be used to look up the loaded asset in its
   * appropriate {@link AssetStorage asset storage}.
   */
  public handle(): Handle<T> {
    return new Handle(this.id, this.file);
  }

}

