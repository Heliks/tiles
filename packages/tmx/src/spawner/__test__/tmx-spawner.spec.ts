import { AssetsBundle } from '@heliks/tiles-assets';
import { runtime, World } from '@heliks/tiles-engine';
import { TmxObjectSpawner, TmxObjectTypeDefault } from '../objects';
import { TmxPhysicsFactory } from '../tmx-physics-factory';
import { TmxSpawner } from '../tmx-spawner';
import { TmxSpawnerConfig } from '../tmx-spawner-config';
import { load } from './utils';


describe('TmxSpawner', () => {
  let spawner: TmxSpawner;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .bundle(new AssetsBundle())
      .provide(TmxSpawnerConfig, new TmxSpawnerConfig(16))
      .provide(TmxPhysicsFactory)
      .provide(TmxObjectTypeDefault)
      .provide(TmxObjectSpawner)
      .provide(TmxSpawner)
      .build()
      .world;

    spawner = world.get(TmxSpawner);
  });


  it('should not spawn layers with a $skip property', async () => {
    const asset = await load(world, 'assets/test-skip-layer.tmj');
    const spawn = jest.fn();

    spawner.spawnLayer = spawn;

    await spawner.spawn(world, asset);

    // Fetch the name of the map with which the spawnLayer method was called.
    const name = spawn.mock.calls[0]?.[2]?.name;

    expect(name).toBe('bar');
    expect(spawn).toHaveBeenCalledTimes(1);
  });
});
