import { ltrim, rtrim, Injectable } from '@tiles/engine';
import { AssetStorage, Format, Handle, LoadType } from './types';

@Injectable()
export class AssetLoader {

  /**
   * The baseURL that is added in front of to every file path that this loader
   * attempts to load.
   */
  protected baseUrl = '';

  /** Combines the given `path` with the loaders [[baseUrl]]. */
  public getPath(path: string): string {
    return `${this.baseUrl}/${ltrim(path, '/')}`;
  }

  /** Sets the [[baseUrl]]. */
  public setBaseUrl(baseUrl: string): this {
    // Normalize base URL by removing trailing slashes.
    this.baseUrl = rtrim(baseUrl, '/');

    return this;
  }

  /** Returns the loaders [[baseUrl]]. */
  public getBaseUrl(): string {
    return this.baseUrl;
  }


  /** Called internally to complete a download. */
  protected complete<D>(
    handle: Handle<D>,
    data: D,
    name: string,
    storage: AssetStorage<D>
  ): void {
    storage.set(handle, {
      name,
      data
    });
  }

  /**
   * Loads a file. Similarly to [[load()]] this function will return a file handle,
   * but only after the asset has finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the loaded asset should be stored.
   */
  public async<D, R>(
    path: string,
    format: Format<D, R, AssetLoader>,
    storage: AssetStorage<R>
  ): Promise<Handle<R>> {
    return this.fetch(path, format).then(data => {
      const handle = Symbol();

      this.complete(handle, data, format.name, storage);

      return handle;
    });
  }

  /**
   * Loads `data` into the given `storage` and returns a file handle that can be used
   * to access it.
   *
   * @param data The data that should be loaded into `storage`.
   * @param storage The storage where the loaded asset should be stored.
   * @typeparam D the data that should be stored as an asset.
   */
  public data<D>(data: D, storage: AssetStorage<D>): Handle<D> {
    const handle = Symbol();

    this.complete(handle, data, '', storage);

    return handle;
  }

  /** Fetches the contents of `file` using `format.` */
  public fetch<D, R>(
    file: string,
    format: Format<D, R, AssetLoader>
  ): Promise<R> {
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
   * Loads a file. Instantly returns a file handle that can be used to access the asset
   * in storage as soon as it completes loading.
   *
   * Note: The asset is only available after it finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the loaded asset should be stored.
   */
  public load<D, R>(
    path: string,
    format: Format<D, R, AssetLoader>,
    storage: AssetStorage<R>
  ): Handle<R> {
    const handle = Symbol();

    // Load the file async and save it to storage.
    this.fetch(path, format).then(
      data => this.complete(handle, data, format.name, storage)
    );

    return handle;
  }

}
