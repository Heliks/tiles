import { Format } from '../formats';
import { Type } from '@heliks/tiles-engine';


/** Function that returns an asset format. */
export type FormatGetter = () => Format<unknown, unknown>;

/** @see AssetCollectionMetadata */
export interface LoadProperty<C> {
  key: keyof C;
  format: FormatGetter;
  path: string;
}

/** Metadata that is stored by the asset collection decorators. */
export interface AssetCollectionMetadata<C> {

  /** Contains the properties that are supposed to be autoloaded by the loader. */
  properties: LoadProperty<C>[];

}

/**
 * Contains the metadata that is stored by the asset collection decorators, mapped
 * to the object type to which they belong.
 */
const METADATA = new Map<Object, AssetCollectionMetadata<unknown>>();

/**
 * Returns the metadata for the given `type`, if any.
 *
 * @see AssetCollection
 * @see AssetCollectionMetadata
 */
export function getCollectionMetadata<C>(type: Type<C>): AssetCollectionMetadata<C> | undefined {
  return METADATA.get(type);
}

/**
 * Flags a property inside an asset collection to be automatically resolved as an
 * asset handle.
 *
 * ```ts
 * class MyCollection {
 *
 *   // The loader will load the asset and store its handle here.
 *   @Load('foo.png', () => new TextureFormat())
 *   public foo!: Handle<Texture>;
 *
 * }
 * ```
 */
export function Load(path: string, format: FormatGetter): PropertyDecorator {
  return function (target: Object, key: string | symbol) {
    let meta = METADATA.get(target.constructor);

    // If no metadata for this object exists yet, create it.
    if (! meta) {
      meta = {
        properties: []
      };

      METADATA.set(target.constructor, meta);
    }

    meta.properties.push(
      { format, key, path } as LoadProperty<unknown>
    );
  };
}
