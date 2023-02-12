import { Injectable, ltrim, noIndent, Type } from '@heliks/tiles-engine';
import { Asset, AssetCollection, AssetStorage, getCollectionMetadata, Handle, LoadingState } from './asset';
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
   * Root path from which assets should be loaded. The loader will prepend this to every
   * file path that it loads.
   */
  public root = './';

  /**
   * @param assets Resource where loaded assets are stored.
   */
  constructor(public readonly assets: AssetStorage) {}

  /** Returns the absolute path of `file` by joining it with the {@link root} URL. */
  public getPath(path: string): string {
    return join(this.root, ltrim(path, '/'))
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
  private complete<T>(handle: Handle<T>, data: T): void {
    handle.state = LoadingState.Loaded;

    this.assets.set(new Asset(
      handle.assetId,
      handle.file,
      data
    ));
  }

  /** @internal */
  private _fetch<T>(file: string): Promise<T> {
    const format = this.getFormatFromFile<T>(file);

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

  /** Fetches the contents of `file`. */
  public fetch<T>(file: string): Promise<T> {
    return this._fetch(normalize(file));
  }

  /** @internal */
  private getFormatFromFile<T = unknown>(file: string): Format<unknown, T, AssetLoader> {
    const extension = getExtension(file);

    if (! extension) {
      throw new Error(`File path ${file} requires an extension.`);
    }

    const format = this.match(extension);

    if (! format) {
      throw new Error(`No format found for file extension ${extension}`);
    }

    return format as Format<unknown, T, AssetLoader>;
  }

  /**
   * Loads a file and returns a `Handle<R>` that can be used to access the file in its
   * asset storage after it has finished loading.
   */
  public load<R>(file: string): Handle<R> {
    const normalized = normalize(file);
    const handle = Handle.from(normalized);

    this._fetch(normalized).then(data => {
      this.complete(handle, data);
    });

    return handle;
  }

  /**
   * Loads a file. Like {@link load} this will return a file handle that can be used to
   * access the asset, but only after the asset has finished loading.
   */
  public async<R>(file: string): Promise<Handle<R>> {
    const normalized = normalize(file);

    return this._fetch(normalized).then(data => {
      const handle = Handle.from(normalized);

      this.complete(handle, data);

      return handle;
    });
  }

  /**
   * Loads `data` into the asset storage as if it were a loaded file. Returns an asset
   * handle with which the asset can be accessed in the {@link AssetStorage}.
   */
  public data<T>(file: string, data: T): Handle<T> {
    const handle = Handle.from(normalize(file));

    this.complete(handle, data);

    return handle;
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
