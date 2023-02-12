import { Injectable, ltrim, noIndent, Type } from '@heliks/tiles-engine';
import { Asset, AssetCollection, AssetStorage, AssetType, getCollectionMetadata, Handle, LoadingState } from './asset';
import { Format, LoadType } from './format';
import { getExtension, join, normalize } from './utils';


/**
 * Can contain any {@link Format}.
 */
type AnyFormat<L> = Format<unknown, unknown, L>;

/**
 * Loads assets via the fetch API.
 *
 * This is the primary way to import assets such as sound, videos, fonts, etc. into the
 * game. The loader will automatically decide which file type to load based on file
 * extension and available {@link Format file formats}.
 *
 * Loaded assets will be placed in appropriate storages depending on the asset type
 * specified by the format that was used to load it.
 */
@Injectable()
export class AssetLoader {

  /**
   * Contains all formats known to the asset loader. All formats here are guaranteed
   * to not have overlapping file extension mappings.
   *
   * @internal
   */
  private readonly formats: AnyFormat<AssetLoader>[] = [];

  /**
   * A map that contains storages mapped to the asset type that they are storing. If an
   * asset is loaded, the loader will automatically put it in the appropriate storage
   * according to the asset type specified by the format that was used to load the
   * asset file. See: {@link Format.getAssetType}.
   *
   * @internal
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

    storage = new AssetStorage();

    this.storages.set(type, storage);

    return storage;
  }

  /** @internal */
  private match(extension: string): AnyFormat<AssetLoader> | undefined {
    for (const format of this.formats) {
      if (format.extensions.includes(extension)) {
        return format;
      }
    }
  }

  /**
   * Registers an asset {@link Format}.
   *
   * The format will be used when a file is being loaded that has an extension that
   * matches one of the formats. There can only be one format per file extension.
   */
  public use(format: AnyFormat<AssetLoader>): this {
    // Make sure the format doesn't match an extension that another format is.
    for (const extension of format.extensions) {
      const match = this.match(extension);

      if (match) {
        throw new Error(noIndent`
          Extension ${extension} of format ${format.constructor.name} is already matched 
          by existing format ${match.constructor.name}.
        `);
      }
    }

    this.formats.push(format);

    return this;
  }

  /** @internal */
  private complete<D>(handle: Handle<D>, data: D, format: Format<unknown, D>): void {
    handle.state = LoadingState.Loaded;

    this
      .storage(format.getAssetType())
      .set(new Asset(
        handle.assetId,
        handle.file,
        data
      ));
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
        case LoadType.Text:
          stream = response.text();
          break;
        case LoadType.Json:
        default:
          stream = response.json();
          break;
      }

      // Process raw data using the asset format.
      return stream.then(
        data => format.process(data, file, this)
      );
    });
  }

  /** @internal */
  private getFormatFromFile(file: string): AnyFormat<AssetLoader> {
    const extension = getExtension(file);

    if (! extension) {
      throw new Error(`File path ${file} requires an extension.`);
    }

    const format = this.match(extension);

    if (! format) {
      throw new Error(`No format found for file extension ${extension}`);
    }

    return format;
  }

  /**
   * Loads a file and returns a `Handle<R>` that can be used to access the file in its
   * asset storage after it has finished loading.
   */
  public load<R>(file: string): Handle<R> {
    const _file = normalize(file);

    const format = this.getFormatFromFile(_file);
    const handle = Handle.from(_file);

    this.fetch(_file, format).then(data => {
      this.complete(handle, data, format);
    });

    return handle;
  }

  /**
   * Loads a file. Like {@link load} this will return a file handle that can be used to
   * access the asset, but only after the asset has finished loading.
   */
  public async<R>(file: string): Promise<Handle<R>> {
    const _file = normalize(file);
    const format = this.getFormatFromFile(_file);

    return this.fetch(_file, format).then(data => {
      const handle = Handle.from(_file);

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
      (collection as any)[ item.key ] = this.load(item.path);
    }

    return new AssetCollection(collection, meta);
  }

}
