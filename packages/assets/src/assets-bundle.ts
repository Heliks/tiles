import { AppBuilder, Bundle, World } from '@heliks/tiles-engine';
import { AssetStorage } from './asset';
import { AssetLoader } from './asset-loader';
import { Fetch, Format, Fs } from './fs';


/**
 * Provides tools for asset management.
 *
 * @see AssetLoader
 */
export class AssetsBundle implements Bundle {

  /** @internal */
  private readonly formats: Format<unknown, unknown, AssetLoader>[] = [];

  /**
   * @param root Root path from which assets are loaded.
   * @param fs Implementation of the file-system used by the asset loader.
   */
  constructor(private readonly root = '', private readonly fs: Fs = new Fetch()) {}

  /**
   * Registers an asset {@link Format} to be used by the {@link AssetLoader}. Only one
   * format per file extension is allowed..
   *
   * @see AssetLoader.use
   */
  public use(format: Format<unknown, unknown, AssetLoader>): this {
    this.formats.push(format);

    return this;
  }

  /** @internal */
  private setupRootPath(world: World): void {
    world.get(AssetLoader).root = this.root;
  }

  /** @internal */
  private setupFormats(world: World): void {
    const loader = world.get(AssetLoader);

    for (const format of this.formats) {
      loader.use(format);
    }
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .provide(AssetStorage)
      .provide(Fs, this.fs)
      .provide(AssetLoader)
      .run(this.setupRootPath.bind(this))
      .run(this.setupFormats.bind(this));
  }

}
