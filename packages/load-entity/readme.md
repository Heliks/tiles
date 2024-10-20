Bundle that registers an asset loader format to load entities from files.

## Usage

After adding the `LoadEntityBundle` to the game runtime, `.entity` and `.entity.json`
can be loaded by the asset loader. There is no additional setup required.

```ts
const app = runtime()
  .bundle(AssetsBundle)          // The AssetsBundle & the SerializationBundle are 
  .bundle(SerializationBundle)   // dependencies and must be registered first.
  .bundle(LoadEntityBundle)
  .build();

async function load(world: World): Promise<LoadedEntity> {
  const loader = world.get(AssetLoader);

  // Load a file that contains entity data.
  const handle = await loader.async('foo.entity');

  // Fetch asset from storage.
  return loader.assets.resolve(handle).data;
}

load(app.world).then(entity => {
  entity.insert(app.world);

  // We can insert as many copies from the loaded data as we want.
  entity.insert(app.world);
  entity.insert(app.world);
});
```