import { Container } from '@heliks/tiles-injector';
import { World } from '../../ecs';
import { TypeSerializer } from '../type-serializer';
import { NoopSerializer } from './noop-serializer';
import { TypeRegistry } from '../index';


describe('DefaultSerializer', () => {
  let types: TypeRegistry;
  let world: World;

  beforeEach(() => {
    const container = new Container();

    types = new TypeRegistry();
    world = new World(container);

    container.instance(types);
  });

  describe('known types', () => {
    // Test type.
    class TestType {}

    beforeEach(() => {
      const typeSerializer = new NoopSerializer();

      typeSerializer.serialize.mockReturnValue(true);
      typeSerializer.deserialize.mockReturnValue(new TestType());

      types.register(TestType, typeSerializer, 'test');
    });

    describe('as properties on serialized type', () => {
      // Test component.
      class Component {
        public foo = new TestType();
      }

      // Tested serialized.
      let fixture: TypeSerializer<Component>;

      beforeEach(() => {
        fixture = new TypeSerializer(Component);
      });

      it('should get serialized', () => {
        const result = fixture.serialize(new Component(), world);

        expect(result.foo).toMatchObject({
          $data: true,
          $type: 'test'
        });
      });

      it('should get deserialized', () => {
        const data = {
          foo: {
            $data: true,
            $type: 'test'
          }
        };

        const component = fixture.deserialize(data, world);

        expect(component.foo).toBeInstanceOf(TestType);
      });
    });

    describe('as items inside of arrays', () => {
      // Test component.
      class Component {
        public foo = [ new TestType() ];
      }

      // Tested serialized.
      let fixture: TypeSerializer<Component>;

      beforeEach(() => {
        fixture = new TypeSerializer(Component);
      });

      it('should get serialized', () => {
        const result = fixture.serialize(new Component(), world);

        expect(result.foo[0]).toMatchObject({
          $data: true,
          $type: 'test'
        });
      });

      it('should get deserialized', () => {
        const data = {
          foo: [
            {
              $data: true,
              $type: 'test'
            }
          ]
        };

        const component = fixture.deserialize(data, world);

        expect(component.foo[0]).toBeInstanceOf(TestType);
      });
    });
  });
});
