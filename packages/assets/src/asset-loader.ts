import { ltrim, rtrim } from '@tiles/engine';
import { Injectable, Optional } from '@tiles/injector';
import { AssetStorage } from './asset-storage';
import { Format, Handle, LoadType } from './types';

@Injectable()
export class AssetLoader {

  /**
   * The baseURL that is added in front of to every file path that this loader
   * attempts to load.
   */
  protected baseUrl = '';

  /**
   * @param baseUrl (optional) [[baseUrl]]
   */
  constructor(@Optional('baseUrl') baseUrl?: string) {
    if (baseUrl) {
      this.setBaseUrl(baseUrl);
    }
  }

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

  /** Fetches the file at `path` using the given `format`. */
  protected fetch<T>(path: string, format: Format<T, unknown>): Promise<T> {
    return fetch(this.getPath(path)).then(response => {
      let stream: Promise<unknown>;

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
        data => format.process(data)
      );
    });
  }

  /** Called internally to complete a download. */
  protected complete<T, R>(
    handle: Handle<T>,
    data: T,
    format: Format<T, R>,
    storage: AssetStorage<T>
  ): void {
    storage.set(handle, {
      name: format.name,
      data
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
  public load<T, R>(path: string, format: Format<T, R>, storage: AssetStorage<T>): Handle<T> {
    const handle = Symbol();

    // Load the file async and save it to storage.
    this.fetch(path, format).then(
      data => this.complete(handle, data, format, storage)
    );

    return handle;
  }

  /**
   * Loads a file. Similarly to [[load()]] this function will return a file handle, but
   * only after the asset has finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the loaded asset should be stored.
   */
  public async<T, R>(path: string, format: Format<T, R>, storage: AssetStorage<T>): Promise<Handle<T>> {
    return this.fetch(path, format).then(data => {
      const handle = Symbol();

      this.complete(handle, data, format, storage);

      return handle;
    });
  }

}
