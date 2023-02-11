import { Uuid } from "@heliks/tiles-engine";


export enum LoadingState {
  /** Asset is currently loading. */
  Loading,
  /** Asset is fully loaded and can be used. */
  Loaded
}

/** A unique pointer to an asset. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Handle<T = unknown> {

  /** Contains the loading state of the asset to which this handle points to. */
  public state = LoadingState.Loading;

  /**
   * @param assetId Id of the asset that this handle points towards.
   * @param file Path to the source file from which the asset to which this handle
   *  points to was loaded.
   */
  constructor(public readonly assetId: string, public readonly file: string) {}

  /** Creates a new {@link Handle} from a `file` path. */
  public static from<T = unknown>(file: string): Handle {
    return new Handle<T>(Uuid.create(file), file);
  }

}
