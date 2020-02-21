import { Injectable, Optional } from '@tiles/injector';
import { Format, Handle, LoadType } from './types';
import { ClassType } from '@tiles/common';
import { AssetStorage } from './asset-storage';

@Injectable()
export class AssetLoader {

  /**
   * @param baseUrl (optional) The baseURL that is prepended to every file
   *  path that this loader attempts to load.
   */
  constructor(@Optional('baseUrl') protected baseUrl = '') {}

  /** Combines the given `path` with the loaders `baseUrl` and returns it. */
  public getPath(path: string): string {
    return this.baseUrl + path;
  }

  /** Fetches the file at `path` using the given `format`. */
  protected async fetch<T>(path: string, format: Format<T, unknown>): Promise<T> {
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

  protected complete<T, R>(
    handle: Handle,
    data: T,
    format: Format<T, R>,
    storage: ClassType<AssetStorage<T>>
  ): void {
    // Todo
  }

  /**
   * Loads a file. Instantly returns a file handle that can be used to
   * access the asset in storage as soon as it completed loading.
   *
   * Note: The asset is only available after it finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the asset should be cached.
   * @returns A file handle pointing to the loaded asset.
   */
  public load<T, R>(
    path: string,
    format: Format<T, R>,
    storage: ClassType<AssetStorage<T>>
  ): Handle {
    const handle = Symbol();

    // Load the file async and save it to storage.
    this.fetch(path, format).then(
      data => this.complete(handle, data, format, storage)
    );

    return handle;
  }

  /**
   * Loads a file. Similarly to {@link load()} this function will return
   * a file handle, but only after the asset has finished loading.
   *
   * @param path Path to the file that should be loaded.
   * @param format The format that should be used to parse the files raw data.
   * @param storage The storage where the asset should be cached.
   * @returns A promise that will resolve a file handle pointing to the
   *  loaded asset.
   */
  public async<T, R>(
    path: string,
    format: Format<T, R>,
    storage: ClassType<AssetStorage<T>>
  ): Promise<Handle> {
    return this.fetch(path, format).then(data => {
      const handle = Symbol();

      this.complete(handle, data, format, storage);

      return handle;
    });
  }

}
