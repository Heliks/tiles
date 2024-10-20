import { Format } from './format';


/** A file-system API used by the {@link AssetLoader}. */
export abstract class Fs {

  /** Loads the contents of the given `file` using `format`. */
  public abstract load<T>(file: string, format: Format<unknown, T>): Promise<T>;

}
