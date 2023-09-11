import { EntitySerializer } from '../entity-serializer';
import { World } from '../../ecs';
import { AppBuilder } from '../../app';
import { NoopSerializer } from '../../types/__test__/noop-serializer';
import { TypeRegistry } from '../../types';


class Foo {}
class Bar {}

describe('EntitySerializer', () => {
  let world: World;
  let serializer: EntitySerializer;

  let _serializers: {
    foo: NoopSerializer;
    bar: NoopSerializer;
  };

  beforeEach(() => {
    world = new AppBuilder().build().world;
    serializer = new EntitySerializer(new TypeRegistry());

    _serializers = {
      foo: new NoopSerializer(),
      bar: new NoopSerializer()
    }

    serializer.types.register(Foo, _serializers.foo, 'foo');
    serializer.types.register(Bar, _serializers.bar, 'bar');
  });

  it('should serialize an entity', () => {
    const entity = world
      .builder()
      .use(new Foo())
      .use(new Bar())
      .build();

    _serializers.foo.serialize = jest.fn().mockReturnValue({
      foo: true,
      bar: false
    });

    _serializers.bar.serialize = jest.fn().mockReturnValue({
      foo: false,
      bar: true
    });

    const data = serializer.serialize(world, entity);

    expect(data).toMatchObject({
      foo: {
        foo: true,
        bar: false
      },
      bar: {
        foo: false,
        bar: true
      }
    })
  });

  it('should deserialize data', () => {
    const foo = new Foo();
    const bar = new Bar();

    // Data to de-serialize.
    const data = {
      foo: true,
      bar: true
    };

    _serializers.foo.deserialize = jest.fn().mockReturnValue(foo);
    _serializers.bar.deserialize = jest.fn().mockReturnValue(bar);

    const entity = serializer
      .deserialize(world, data)
      .build();

    const result = {
      hasFoo: world.storage(Foo).has(entity),
      hasBar: world.storage(Bar).has(entity)
    };

    expect(result).toMatchObject({
      hasFoo: true,
      hasBar: true
    });
  });

  it('should extract components from entity data', () => {
    _serializers.foo.deserialize.mockReturnValue(new Foo());

    const components = serializer.extract(world, {
      foo: true
    });

    expect(components.find(Foo)).toBeInstanceOf(Foo);
  });
});
