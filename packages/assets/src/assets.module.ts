import { AssetLoader } from './asset-loader';
import { Module , GameBuilder } from '@tiles/engine';


/** Module that provides tools for asset loading and management. */
export class AssetsModule implements Module {

  /** {@inheritDoc} */
  public build(builder: GameBuilder): void {
    builder.provide(AssetLoader);
  }

}
