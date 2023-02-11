import { AssetLoader } from '../asset-loader';
import { Handle, Load } from '../asset';


describe('AssetLoader', () => {
  it('should load collections', () => {
    class Foo {

      @Load('foo.png')
      public foo!: Handle;

    }

    const loader = new AssetLoader();

    // Do not actually load the assets.
    loader.load = jest.fn().mockImplementation(() => Handle.from('foo.png'));

    const collection = loader.collection(Foo);

    expect(collection.data.foo).toBeInstanceOf(Handle);
  });
});
