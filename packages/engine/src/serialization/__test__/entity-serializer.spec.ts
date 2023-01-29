import { EntitySerializer } from '../entity-serializer';
import { World } from '../../ecs';
import { GameBuilder } from '../../game';
import { NoopSerializer } from '../../types/__test__/noop-serializer';
import { TypeRegistry } from '../../types';


class Foo {}
class Bar {}

describe('EntitySerializer', () => {
  let world: World;
  let serializer: EntitySerializer;

  // Serializers for Foo and Bar component.
  let $foo: NoopSerializer;
  let $bar: NoopSerializer;

  beforeEach(() => {
    world = new GameBuilder().build().world;
    serializer = new EntitySerializer(new TypeRegistry());

    $foo = new NoopSerializer();
    $bar = new NoopSerializer();

    serializer.types.register(Foo, $foo, 'foo');
    serializer.types.register(Bar, $bar, 'bar');
  });

  it('should serialize an entity', () => {
    const entity = world
      .builder()
      .use(new Foo())
      .use(new Bar())
      .build();

    $foo.serialize = jest.fn().mockReturnValue({
      foo: true,
      bar: false
    });

    $bar.serialize = jest.fn().mockReturnValue({
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

    $foo.deserialize = jest.fn().mockReturnValue(foo);
    $bar.deserialize = jest.fn().mockReturnValue(bar);

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
});
