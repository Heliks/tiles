import { World } from '../world';
import { EntityGroup } from '../entity-group';
import { Filter } from '../filter';
import { BitSet } from '../bit-set';
import { CompositionBit } from '../changes';
import { Entity } from '../entity';

class WorldMock extends World {

  /** Helper to add a test group from composition bits. */
  public createTestGroup(inc: CompositionBit, exc: CompositionBit): EntityGroup {
    const group = new EntityGroup(new Filter(
      new BitSet(inc),
      new BitSet(exc)
    ));

    this.groups.push(group);

    return group;
  }

  /**
   * Helper to create a dirty entity that has a composition `bit` automatically applied.
   * The fact that neither component nor storage for this bit exists does not matter.
   */
  public createDirty(bit: CompositionBit): Entity {
    const entity = this.create();

    // Add the composition bit to the entity directly. The fact that neither component
    // nor storage for this bit exists does not matter.
    this.changes.add(entity, bit);

    return entity;
  }

}

describe('World', () => {
  let world: WorldMock;

  class A {
  }

  class B {
  }

  beforeEach(() => {
    world = new WorldMock();
  });

  it('should register component storages', () => {
    const storage1 = world.register(A);
    const storage2 = world.register(A);
    const storage3 = world.register(A);

    expect(storage1.id).toBe(1);
    expect(storage2.id).toBe(2);
    expect(storage3.id).toBe(4);
  });

  it('should create compositions', () => {
    const storageA = world.storage(A);
    const storageB = world.storage(B);

    const composition = world.createComposition([A, B]);

    expect(composition.has(storageA.id)).toBeTruthy();
    expect(composition.has(storageB.id)).toBeTruthy();
  });

  // Test for synchronizing entity groups.
  describe('sync()', () => {
    // Bits representing different kinds of components
    const compBitA = 1;
    const compBitB = 2;
    const compBitC = 4;
    const compBitD = 8;

    it('should add eligible entities to groups', () => {
      const group = world.createTestGroup(compBitA | compBitB, compBitC);

      const entity1 = world.createDirty(compBitA | compBitB);
      const entity2 = world.createDirty(compBitA | compBitB | compBitD);

      // Create non-eligible entities to verify that only the correct entities were
      // really added to the groups.
      const entity3 = world.createDirty(compBitA);
      const entity4 = world.createDirty(compBitA | compBitB | compBitC);

      world.sync();

      expect(group.has(entity1)).toBeTruthy();
      expect(group.has(entity2)).toBeTruthy();

      expect(group.has(entity3)).toBeFalsy();
      expect(group.has(entity4)).toBeFalsy();
    });

    it('should remove non-eligible entities from groups', () => {
      const group = world.createTestGroup(compBitA | compBitB, compBitC);

      const entity1 = world.createDirty(compBitA);
      const entity2 = world.createDirty(compBitA | compBitB | compBitC);

      group.add(entity1);
      group.add(entity2);

      world.sync();

      expect(group.has(entity1)).toBeFalsy();
      expect(group.has(entity2)).toBeFalsy();
    });
  });

  describe('update()', () => {
    it('should synchronize groups', () => {
      world.sync = jest.fn();
      world.update();

      expect(world.sync).toHaveBeenCalledTimes(1);
    });
  });
});
