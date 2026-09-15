import { ltrim } from '@heliks/tiles-engine';
import { join } from '../utils';
import { Format } from './format';


/** A file-system API used by the {@link AssetLoader}. */
export abstract class Fs {

  /** Loads the contents of the given `file` using `format`. */
  public abstract load<T>(file: string, format: Format<unknown, T>): Promise<T>;

  /**
   * Normalizes the given `path` so that it is compatible with the asset loader.
   *
   * The path produced by this function should be absolute
   *
   * @param root The asset root path provided by the asset loader.
   * @param path The file path to normalize.
   */
  public normalize(root: string, path: string): string {
    return join(root, ltrim(path, '/'));
  }

}
