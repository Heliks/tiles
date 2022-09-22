import { AssetLoader } from '../asset-loader';
import { Handle } from '../asset';
import { Load } from '../asset';
import { uuid } from '@heliks/tiles-engine';
import { NoopFormat } from './noop-format';


describe('AssetLoader', () => {
  it('should load collections', () => {
    class Foo {

      @Load('foo.png', () => new NoopFormat())
      public foo!: Handle;

    }

    const loader = new AssetLoader();

    // Do not actually load the assets.
    loader.load = jest.fn().mockImplementation(() => new Handle(uuid()));

    const collection = loader.collection(Foo);

    expect(collection.data.foo).toBeInstanceOf(Handle);
  });
});
