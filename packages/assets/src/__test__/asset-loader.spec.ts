import { AssetStorage, Handle, Load } from '../asset';
import { AssetLoader } from '../asset-loader';


describe('AssetLoader', () => {
  let loader: AssetLoader;
  let storage: AssetStorage;

  beforeEach(() => {
    storage = new AssetStorage();
    loader = new AssetLoader(storage);
  });

  it('should load collections', () => {
    class Foo {
      @Load('foo.png')
      public foo!: Handle;
    }

    // Do not actually load the assets.
    loader.load = jest.fn().mockImplementation(() => Handle.from('foo.png'));

    const collection = loader.collection(Foo);

    expect(collection.data.foo).toBeInstanceOf(Handle);
  });

  describe('when loading assets', () => {
    it('should not load the same asset twice', () => {
      const fetch = jest.fn();

      loader.fetch = fetch;

      loader.load('foo.txt');
      loader.load('foo.txt');
      loader.load('bar.txt');

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('when loading assets asynchronously', () => {
    it('should not load the same asset twice', async () => {
      const fetch = jest.fn();

      loader.fetch = fetch;

      await loader.async('foo.txt');
      await loader.async('foo.txt');
      await loader.async('bar.txt');

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should wait complete load when same asset is loaded twice', async () => {
      // Our fetch call
      loader.fetch = jest.fn().mockImplementation(() => {
        return new Promise<boolean>(resolve => {
          // Make sure to slightly delay the "loading" so that the second call in our
          // test has time to (potentially) complete before the loading process.
          setTimeout(() => resolve(true), 50);
        });
      });

      // Do not wait for this to complete.
      void loader.async('foo.txt');

      const handle = await loader.async('foo.txt');
      const asset = loader.assets.get(handle);

      expect(asset).not.toBeUndefined();
    });
  });
});
