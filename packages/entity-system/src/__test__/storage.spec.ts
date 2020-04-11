import { World } from '../world';
import { Entity } from '../types';
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
    entity = 0;
    storage = world.storage(A);
  });

  it('should assign data to the component instance when an entity is added', () => {
    storage.add(entity, {
      test: 'foobar'
    });

    expect(storage.get(entity).test).toBe('foobar');
  });

  it('should update entity compositions when an entity is added', () => {
    const composition = world.entities.getComposition(entity);

    storage.add(entity);

    expect(composition.has(storage.id)).toBeTruthy();
  });

  it('should update entity compositions when a component instance is added for an entity', () => {
    const composition = world.entities.getComposition(entity);

    storage.set(entity, new A());

    expect(composition.has(storage.id)).toBeTruthy();
  });

  it('should update entity compositions when an entity is removed', () => {
    const composition = world.entities.getComposition(entity);

    storage.add(entity);

    // Validate false positives
    expect(composition.has(storage.id)).toBeTruthy();

    storage.remove(entity);

    expect(composition.has(storage.id)).toBeFalsy();
  });

});
