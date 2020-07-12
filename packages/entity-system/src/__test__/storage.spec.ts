import { World } from '../world';
import { ComponentEventType, Entity } from '../types';
import { Storage } from '../storage';

describe('Storage', () => {
  class A {
    public test = '';
  }

  let entity: Entity;
  let storage: Storage<A>;
  let world: World;

  beforeEach(() => {
    world = new World();
    entity = Math.random();
    storage = world.storage(A);
  });

  // Add component
  describe('add()', () => {
    it('should create a new component instance for an entity', () => {
      storage.add(entity);

      // Component should now be stored for entity.
      expect(storage.get(entity)).toBeInstanceOf(A);
    });

    it('should update entity compositions', () => {
      storage.add(entity);

      expect(
        world.changes.composition(entity).has(storage.id)
      ).toBeTruthy();
    });

    it('should emit a ComponentEvent', () => {
      const subscriber = storage.events().subscribe();

      storage.add(entity);

      expect(storage.events().next(subscriber)).toEqual({
        entity,
        type: ComponentEventType.Added
      });
    });
  });

  // Set component
  describe('set()', () => {
    it('should update entity compositions', () => {
      storage.set(entity, new A());

      expect(
        world.changes.composition(entity).has(storage.id)
      ).toBeTruthy();
    });

    it('should emit a ComponentEvent', () => {
      const subscriber = storage.events().subscribe();

      storage.set(entity, new A());

      expect(storage.events().next(subscriber)).toEqual({
        entity,
        type: ComponentEventType.Added
      });
    });
  });

  // Remove component
  describe('remove()', () => {
    it('should update entity compositions', () => {
      const composition = world.changes.composition(entity);

      storage.add(entity);
      storage.remove(entity);

      expect(composition.has(storage.id)).toBeFalsy();
    });

    it('should emit a ComponentEvent', () => {
      storage.add(entity);

      // Subscribe after component was added because we are only interested
      // in the second one when the component is removed.
      const subscriber = storage.events().subscribe();

      storage.remove(entity);

      expect(storage.events().next(subscriber)).toEqual({
        entity,
        type: ComponentEventType.Removed
      });
    });
  });
});
