import { Bundle, AppBuilder } from '@heliks/tiles-engine';
import { AssetLoader } from './asset-loader';
import { Format } from './format';


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

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    const loader = new AssetLoader(this.root);

    for (const format of this.formats) {
      loader.use(format);
    }

    builder.provide({
      token: AssetLoader,
      value: loader
    });
  }

}
