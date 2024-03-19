import { Bundle, AppBuilder, World } from '@heliks/tiles-engine';
import { AssetLoader } from './asset-loader';
import { Format } from './format';
import { AssetStorage } from './asset';


/**
 * Provides tools for asset management.
 *
 * @see AssetLoader
 */
export class AssetsBundle implements Bundle {

  /** @internal */
  private readonly formats: Format<unknown, unknown, AssetLoader>[] = [];

  /**
   * @param root (optional) Root path from which assets should be loaded. The loader
   *  will prepend this to every file path that ot loads.
   */
  constructor(private readonly root = '') {}

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
      .provide(AssetLoader)
      .run(this.setupRootPath.bind(this))
      .run(this.setupFormats.bind(this));
  }

}
