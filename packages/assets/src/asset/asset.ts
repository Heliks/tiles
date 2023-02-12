import { Uuid, UUID } from '@heliks/tiles-engine';
import { Handle } from './handle';


/**
 * A loaded asset.
 *
 * - `T`: Asset type.
 */
export class Asset<T = unknown> {

  /**
   * @param id: Unique asset identifier.
   * @param file Path to the source file from which the asset was loaded.
   * @param data Contains the processed asset data.
   */
  constructor(
    public readonly id: UUID,
    public readonly file: string,
    public readonly data: T
  ) {}

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

