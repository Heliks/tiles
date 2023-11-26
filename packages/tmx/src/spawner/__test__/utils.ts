import { AssetLoader } from '@heliks/tiles-assets';
import { World } from '@heliks/tiles-engine';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TmxLoadTilemap } from '../../formats';
import { TmxMapAsset } from '../../parser';


export function load(world: World, file: string): Promise<TmxMapAsset> {
  const path = join(__dirname, file);
  const data = JSON.parse(
    readFileSync(path).toString()
  );

  return new TmxLoadTilemap().process(data, path, world.get(AssetLoader));
}