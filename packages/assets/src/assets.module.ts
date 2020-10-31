import { AssetLoader } from './asset-loader';
import { GameBuilder, Module } from '@heliks/tiles-engine';

/** Module that provides tools for asset loading and management. */
export class AssetsModule implements Module {

  /**
   * @param baseUrl (optional) Directory from which the loader is attempting to load
   *  assets. If not specified the games working directory will be used.
   */
  constructor(private readonly baseUrl = '') {}

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.provide({
      token: AssetLoader,
      value: new AssetLoader(this.baseUrl)
    });
  }

}
