import { AssetLoader, AssetsBundle } from '@heliks/tiles-assets';
import { App, runtime, Transform, World } from '@heliks/tiles-engine';
import { TmxDefaultObjectFactory, TmxObjectSpawner } from '../objects';
import { TmxPhysicsFactory } from '../tmx-physics-factory';
import { TmxSpawnMap, TmxSpawnState } from '../tmx-spawn-map';
import { TmxSpawner } from '../tmx-spawner';
import { TmxSpawnerConfig } from '../tmx-spawner-config';
import { TmxSpawnerSystem } from '../tmx-spawner-system';
import { load } from './utils';


describe('TmxSpawnerSystem', () => {
  let app: App;
  let loader: AssetLoader;
  let spawner: TmxSpawner;
  let system: TmxSpawnerSystem;
  let world: World;

  beforeEach(() => {
    app = runtime()
      .bundle(new AssetsBundle())
      .provide(TmxSpawnerConfig, new TmxSpawnerConfig(16))
      .provide(TmxPhysicsFactory)
      .provide(TmxDefaultObjectFactory)
      .provide(TmxObjectSpawner)
      .provide(TmxSpawner)
      .system(TmxSpawnerSystem)
      .build();

    // Start the game to boot systems.
    app.start({
      update: jest.fn()
    });

    world = app.world;

    loader = world.get(AssetLoader);
    spawner = world.get(TmxSpawner);
    system = world.get(TmxSpawnerSystem);

    // Load files directly from file-system.
    loader.fetch = jest.fn().mockImplementation(file => load(world, file));

    // Do not actually spawn anything into the world.
    spawner.spawn = jest.fn();
  });

  describe('when spawning maps', () => {
    it('should spawn maps', async () => {
      const handle = await loader.async('assets/test-spawn.tmj');
      const asset = loader.assets.resolve(handle);

      const entity = world.insert(new Transform(0, 0), new TmxSpawnMap(handle));

      app.update();

      expect(spawner.spawn).toHaveBeenCalledWith(world, asset, entity);
    });

    it('should update the component state to spawning', async () => {
      const handle = await loader.async('assets/test-spawn.tmj');
      const component = new TmxSpawnMap(handle);

      world.insert(new Transform(0, 0), component);

      app.update();

      expect(component.state).toBe(TmxSpawnState.Spawning);
    });

    it('should update component state when map has finished spawning', async () => {
      const spawnAssetPromise = Promise.resolve();

      const handle = await loader.async('assets/test-spawn.tmj');
      const component = new TmxSpawnMap(handle);

      // Instantly complete the loading process.
      spawner.spawn = jest.fn().mockReturnValue(spawnAssetPromise);

      world.insert(new Transform(0, 0), component);

      // This update spawns the map.
      app.update();

      // await has a slight performance overhead, which means that even if the spawn
      // promise is resolved instantly, it's not guaranteed that the next app.update()
      // occurs AFTER the systems inner await of that promise has finished. In praxis,
      // this is not an issue because we only need it to be completed on the immediate
      // next frame for testing purposes. Manually waiting for it to complete before
      // updating the app will work around this issue
      await spawnAssetPromise;

      // This update finishes the spawning process.
      app.update();

      expect(component.state).toBe(TmxSpawnState.Spawned);
    });
  });
});