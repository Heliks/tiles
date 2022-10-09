import { Injectable, ltrim, Type } from '@heliks/tiles-engine';
import { AssetCollection, AssetStorage, AssetType, getCollectionMetadata, Handle, LoadingState } from './asset';
import { Format, LoadType } from './formats';
import { join } from './utils';


/**
 * Loads assets via the fetch API.
 *
 * This is the primary way to import assets such as sound, videos, fonts, etc. into the
 * game. The loader will put assets in appropriate storages depending on the asset type
 * specified by the format that was used to load the file. Storages for asset types can
 * be accessed via {@link storage()}.
 */
@Injectable()
export class AssetLoader {

  /**
   * A map that contains storages mapped to the asset type that they are storing. If an
   * asset is loaded, the loader will automatically put it in the appropriate storage
   * according to the asset type specified by the format that was used to load the
   * asset file. See: {@link Format.getAssetType}.
   */
  private readonly storages = new Map<AssetType, AssetStorage<unknown>>();

  /**
   * @param root Root path from which assets should be loaded. The loader will prepend
   *  this to every file path that it loads.
   */
  constructor(public root = '') {}

  /** Returns the absolute path of `file` by joining it with the {@link root} URL. */
  public getPath(path: string): string {
    return join(this.root, ltrim(path, '/'))
  }

  /**
   * Returns the storage that is used to store assets that are loaded with the given
   * file `format`. If the storage does not exist, it will be created in the process.
   *
   * ```ts
   * // Returns the storage for all assets loaded with the `ImageFormat`.
   * const storage = assets.storage(ImageFormat);
   * ```
   */
  public storage<R = unknown>(type: AssetType<R>): AssetStorage<R> {
    let storage = this.storages.get(type) as AssetStorage<R>;

    if (storage) {
      return storage;
    }

    storage = new Map();

    this.storages.set(type, storage);

    return storage;
  }

  /** @internal */
  private complete<D>(handle: Handle<D>, data: D, format: Format<unknown, D>): void {
    handle.state = LoadingState.Loaded;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.storage(format.getAssetType()).set(handle, {
      data,
      name: format.name
    });
  }

  /**
   * Loads `data` as an asset into the given asset `storage` and returns a `Handle<D>`
   * with which it can be accessed.
   */
  public data<D>(data: D, storage: AssetStorage<D>): Handle<D> {
    const handle = new Handle('');

    storage.set(handle, {
      name: '',
      data
    });

    return handle;
  }

  /** Fetches the contents of `file` using `format.` */
  public fetch<D, R>(file: string, format: Format<D, R, AssetLoader>): Promise<R> {
    return fetch(this.getPath(file)).then(response => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let stream: Promise<any>;

      // Parse the fetched data according to the type specified
      // in the format.
      switch (format.type) {
        case LoadType.ArrayBuffer:
          stream = response.arrayBuffer();
          break;
        case LoadType.Blob:
          stream = response.blob();
          break;
        case LoadType.Json:
          stream = response.json();
          break;
        case LoadType.Text:
        default:
          stream = response.text();
          break;
      }

      // Process raw data using the asset format.
      return stream.then(
        data => format.process(data, file, this)
      );
    });
  }

  /**
   * Loads a file and returns a `Handle<R>` that can be used to access the file in its
   * asset storage after it has finished loading.
   */
  public load<D, R>(path: string, format: Format<D, R, AssetLoader>): Handle<R> {
    const handle = new Handle(path);

    this.fetch(path, format).then(data => {
      this.complete(handle, data, format);
    });

    return handle;
  }

  /**
   * Loads a file. Like {@link load} this will return a file handle that can be used to
   * access the asset, but only after the asset has finished loading.
   */
  public async<D, R>(path: string, format: Format<D, R, AssetLoader>): Promise<Handle<R>> {
    return this.fetch(path, format).then(data => {
      const handle = new Handle(path);

      this.complete(handle, data, format);

      return handle;
    });
  }

  /**
   * Creates an instance of the given asset collection `type` and autoloads all
   * appropriate asset handles.
   *
   * ```ts
   * class MyCollection {
   *
   *   @Load('foo.png', () => new LoadTexture())
   *   public texture!: Handle<Texture>;
   *
   * }
   *
   * const collection = loader.collection(MyCollection);
   *
   * // Contains the asset handle that can be used to resolve the texture asset from
   * // its appropriate storage.
   * console.log(collection.data.texture);
   * ```
   *
   * @see AssetCollection
   */
  public collection<C>(type: Type<C>): AssetCollection<C> {
    const meta = getCollectionMetadata(type);

    if (! meta) {
      throw new Error('Class type is not an asset collection.');
    }

    // eslint-disable-next-line new-cap
    const collection = new type();

    for (const item of meta.properties) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (collection as any)[ item.key ] = this.load(item.path, item.format());
    }

    return new AssetCollection(collection, meta);
  }

}
