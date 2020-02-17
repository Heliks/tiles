/** A unique pointer to an asset. */
export type Handle = symbol;

/** Possible ways to load an asset. */
export enum LoadType {
  ArrayBuffer,
  Blob,
  Json,
  Text
}

/**
 * An asset format.
 *
 * T: The asset data that this format produces
 * R: The kind of data that this format reads.
 */
export interface Format<T, R> {
  /** Will be passed down to all assets that are loaded with this format. */
  readonly name: string;
  /** Returns the `LoadType` of an asset. */
  readonly type: LoadType;
  /** Reads the given `data` and produces asset data `R`. */
  process(data: R): Promise<T> | T;
}

/**
 * A loaded asset
 * 
 * T: The processed data produced by the format that loaded this asset.
 */
export interface Asset<T> {
  /**
   * The assets processed data.
   */
  readonly data: T;
  /**
   * The name of the asset type. Will be inherited from the `Format` that
   * processed this asset.
   */
  readonly name: string;
}

