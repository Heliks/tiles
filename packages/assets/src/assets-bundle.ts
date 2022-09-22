import { Bundle, GameBuilder } from '@heliks/tiles-engine';
import { AssetLoader } from './asset-loader';


/**
 * Provides tools for asset management.
 *
 * @see AssetLoader
 */
export class AssetsBundle implements Bundle {

  /**
   * @param root (optional) Root path from which assets should be loaded. The loader
   *  will prepend this to every file path that ot loads.
   */
  constructor(private readonly root = '') {}

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.provide({
      token: AssetLoader,
      value: new AssetLoader(this.root)
    });
  }

}
