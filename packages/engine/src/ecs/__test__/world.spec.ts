import { Container } from '@heliks/tiles-injector';
import { OnInit } from '../lifecycle';
import { World } from '../world';


describe('World', () => {
  let world: World;

  beforeEach(() => {
    world = new World(new Container());
  });

  describe('when adding resources', () => {
    class Foo {}

    it('should add a type as resource', () => {
      world.add(Foo);

      expect(world.get(Foo)).toBeInstanceOf(Foo);
    });

    it('should add an instance as resource', () => {
      const instance = new Foo();

      world.add(instance);

      expect(world.get(Foo)).toBe(instance);
    });

    it('should call OnInit lifecycle', () => {
      const onInit = jest.fn();

      class Foo implements OnInit {
        onInit = onInit;
      }

      world.add(Foo);

      expect(onInit).toHaveBeenCalledWith(world);
    });

    it('should throw if resource type already exists in the world', () => {
      world.add(Foo);

      expect(() => world.add(Foo)).toThrow();
    });
  });

  describe('when removing resources', () => {
    class Foo {}

    it('should throw when removing a type that is not a resource', () => {
      expect(() => world.remove(Foo)).toThrow();
    });

    it('should remove the resource from the service container', () => {
      world.add(Foo);
      world.remove(Foo);

      expect(world.has(Foo)).toBeFalsy();
    });
  });
});