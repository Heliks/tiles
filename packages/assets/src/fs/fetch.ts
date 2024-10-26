import { Format, LoadType } from './format';
import { Fs } from './fs';


/** Asset loader file-system that uses the Web Fetch-API. */
export class Fetch implements Fs {

  /** @inheritDoc */
  public load<T = unknown>(file: string, format: Format<unknown, unknown>): Promise<T> {
    return fetch(file).then(response => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let stream: Promise<any>;

      // Parse the fetched data according to the type specified in the format.
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

      return stream;
    });
  }

}
