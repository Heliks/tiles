import { AssetLoader, AssetsBundle } from '@heliks/tiles-assets';
import { runtime, World } from '@heliks/tiles-engine';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TmxLoadTilemap } from '../../formats';
import { TmxMapAsset } from '../../parser';
import { TmxObjectTypes } from '../objects';
import { TmxPhysicsFactory } from '../tmx-physics-factory';
import { TmxSpawner } from '../tmx-spawner';
import { TmxSpawnerConfig } from '../tmx-spawner-config';


describe('TmxSpawner', () => {
  let spawner: TmxSpawner;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .bundle(new AssetsBundle())
      .provide(TmxSpawnerConfig, new TmxSpawnerConfig(16))
      .provide(TmxObjectTypes)
      .provide(TmxPhysicsFactory)
      .provide(TmxSpawner)
      .build()
      .world;

    spawner = world.get(TmxSpawner);
  });

  function load(file: string): Promise<TmxMapAsset> {
    const path = join(__dirname, file);
    const data = JSON.parse(
      readFileSync(path).toString()
    );

    return new TmxLoadTilemap().process(data, path, world.get(AssetLoader));
  }

  it('should not spawn layers with a $skip property', async () => {
    const asset = await load('assets/test-skip-layer.tmj');
    const spawn = jest.fn();

    spawner.spawnLayer = spawn;
    spawner.spawn(world, asset);

    // Fetch the name of the map with which the spawnLayer method was called.
    const name = spawn.mock.calls[0]?.[2]?.name;

    expect(name).toBe('bar');
    expect(spawn).toHaveBeenCalledTimes(1);
  });
});
