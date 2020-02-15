import { EntityManager } from '../entity-manager';
import { World } from '../world';
import { ClassType, Query } from '../types';
import { BitSet } from '../bit-set';

describe('EntityManager', () => {
  class A {
  }

  class B {
  }

  class C {
  }

  class D {
  }

  let entityMgr: EntityManager;
  let world: World;

  /**  Helper method to create a "dirty" entity with components. */
  function createEntity(components?: ClassType[]) {
    const entity = world.create(components);

    world.insert(entity, true);

    return entity;
  }

  beforeEach(() => {
    world = new World();
    entityMgr = world.entities;
  });

  it('should create a composition bit set', () => {
    expect(entityMgr.getComposition(createEntity())).toBeInstanceOf(BitSet);
  });

  it('should add eligible entities to groups', () => {
    const group = world.query({
      contains: [A, B],
      excludes: [C]
    });

    const entity1 = createEntity([A, B]);
    const entity2 = createEntity([A, B, D]);

    // Non-eligible entities to make sure that no entities are
    // added to the group that shouldn't be there.
    const entity3 = createEntity([A]);
    const entity4 = createEntity([A, B, C]);

    entityMgr.sync(world.getGroups());

    expect(group.has(entity1)).toBeTruthy();
    expect(group.has(entity2)).toBeTruthy();

    expect(group.has(entity3)).toBeFalsy();
    expect(group.has(entity4)).toBeFalsy();
  });

  it('should remove non-eligible entities from groups', () => {
    const group = world.query({
      contains: [A, B],
      excludes: [C]
    });

    const entity1 = createEntity([A]);
    const entity2 = createEntity([A, B, C]);

    group.add(entity1);
    group.add(entity2);

    entityMgr.sync(world.getGroups());

    expect(group.has(entity1)).toBeFalsy();
    expect(group.has(entity2)).toBeFalsy();
  });
});
