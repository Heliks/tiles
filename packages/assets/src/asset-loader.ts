import { ltrim, rtrim } from '@tiles/engine';
import { Injectable } from '@tiles/injector';
import { AssetStorage } from './asset-storage';
import { Format, Handle, Loader, LoadType } from './types';

@Injectable()
export class AssetLoader implements Loader<Format<unknown, unknown>> {

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
  protected complete<D, R>(
    handle: Handle<R>,
    data: R,
    format: Format<D, R>,
    storage: AssetStorage<R>
  ): void {
    storage.set(handle, {
      name: format.name,
      data
    });
  }

  /** {@inheritDoc} */
  public async<D, R>(
    path: string,
    format: Format<D, R>,
    storage: AssetStorage<R>
  ): Promise<Handle<R>> {
    return this.fetch(path, format).then(data => {
      const handle = Symbol();

      this.complete(handle, data, format, storage);

      return handle;
    });
  }

  /** Fetches the contents of `file` using the given `format.` */
  public fetch<D, R>(file: string, format: Format<D, R>): Promise<R> {
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

  /** {@inheritDoc} */
  public load<D, R>(
    path: string,
    format: Format<D, R>,
    storage: AssetStorage<R>
  ): Handle<R> {
    const handle = Symbol();

    // Load the file async and save it to storage.
    this.fetch(path, format).then(
      data => this.complete(handle, data, format, storage)
    );

    return handle;
  }

}
