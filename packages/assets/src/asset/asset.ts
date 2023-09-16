import { Uuid, UUID } from '@heliks/tiles-engine';
import { Handle } from './handle';


export enum AssetState {
  /** Asset has been created, but has not been loaded yet. */
  Pending,
  /** Asset is in the process of getting loaded. */
  Loading,
  /** Asset has been fully loaded and can be accessed in the storage. */
  Loaded
}

/**
 * External data loaded from the filesystem or network.
 *
 * Each asset is unique to its source file, which means that if the same file is loaded
 * twice, the {@link AssetLoader loader} will re-use the same asset internally.
 *
 * Loaded assets can be retrieved from the {@link AssetStorage storage}.
 *
 * - `T`: Asset data.
 */
export class Asset<T = unknown> {

  /** Contains the assets current state. */
  public state = AssetState.Pending;

  /**
   * @param id Identifier unique for {@link file}.
   * @param file Path to the file from which this asset was loaded.
   * @param data If the asset is {@link AssetState.Loaded}, contains the asset data.
   */
  constructor(public readonly id: UUID, public readonly file: string, public data?: T) {}

  /** Creates a new {@link Asset} from raw `data`. */
  public static from<T>(file: string, data: T): Asset<T> {
    return new Asset(Uuid.create(file), file, data);
  }

  /**
   * Creates a new {@link Handle} that can be used to look up the loaded asset in its
   * appropriate {@link AssetStorage asset storage}.
   */
  public handle(): Handle<T> {
    return new Handle(this.id, this.file);
  }

}