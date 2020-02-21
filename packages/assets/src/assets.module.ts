import { AssetLoader } from './asset-loader';
import { ModuleDesc } from '@tiles/engine';

/** Module that provides tools for asset loading and management. */
@ModuleDesc({
  provides: [
    AssetLoader
  ],
  exports: [
    AssetLoader
  ]
})
export class AssetsModule {}
