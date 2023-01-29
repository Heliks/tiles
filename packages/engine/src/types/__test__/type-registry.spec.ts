import { TypeRegistry } from '../type-registry';
import { NoopSerializer } from './noop-serializer';


describe('TypeRegistry', () => {
  let types: TypeRegistry;

  class Foo {}
  class Bar {}

  beforeEach(() => {
    types = new TypeRegistry();
  });

  describe('when registering a type', () => {
    it('should throw an error if it is already registered', () => {
      expect(() => {
        types.register(Foo, new NoopSerializer(), 'foo');
        types.register(Foo, new NoopSerializer(), 'bar');
      }).toThrow();
    });

    it('should throw an error if name is already in use', () => {
      expect(() => {
        types.register(Foo, new NoopSerializer(), 'foo');
        types.register(Bar, new NoopSerializer(), 'foo');
      }).toThrow();
    });
  });
});
