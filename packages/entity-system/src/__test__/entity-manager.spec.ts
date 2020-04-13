// The amount of bits we reserve on an entity for its version, e.g. for the entity
// `10110011` the bits `0011` would contain its version.
import { BitSet } from "../bit-set";
import { EntityGroup } from "../entity-group";
import { Filter } from "../filter";
import { Entity } from "../types";
import { EntityManager, ENTITY_MASK, ENTITY_BITS } from "../entity-manager";


describe('EntityManager', () => {
  let em: EntityManager;

  beforeEach(() => {
    em = new EntityManager();
  });

  it('should create entities', () => {
    const a = em.create();
    const b = em.create();

    // Check if the index segment of the entity is correct.
    expect(a & ENTITY_MASK).toBe(0);
    expect(b & ENTITY_MASK).toBe(1);
  });

  it('should return existing entities at the given position', () => {
    const a = em.create();
    const b = em.create();

    expect(em.get(0)).toBe(a);
    expect(em.get(1)).toBe(b);
  });

  it('should destroy entities', () => {
    em.create();
    em.create();
    em.create();

    // Destroy the middle entity.
    em.destroy(em.get(1));

    // Get the version of both entities as they are now in the manager. Entity "a"
    // should be at version 0 while "b" should have its version increased to 1.
    expect(em.get(0) >> ENTITY_BITS).toBe(0);
    expect(em.get(1) >> ENTITY_BITS).toBe(1);
    expect(em.get(2) >> ENTITY_BITS).toBe(0);
  });

  it('should not destroy already destroyed entities', () => {
    const entity = em.create();

    em.destroy(entity);
    em.destroy(entity);

    // Entity version should've increased only on the first destroy,
    // while the second should be ignored.
    expect(em.get(0) >> ENTITY_BITS).toBe(1);
  });

  it('should recycle destroyed entities', () => {
    for (let i = 0; i < 10; i++) {
      em.create();
    }

    // Destroy entity at index 4
    em.destroy(
      em.get(4)
    );

    const entity = em.create();

    // The newly created entity should be recycled, occupying the same index
    // as the previously destroyed one with an increased version.
    expect(entity & ENTITY_MASK).toBe(4);
    expect(entity >> ENTITY_BITS).toBe(1);
  });

  it('should check if an entity is alive', () => {
    const a = em.create();
    const b = em.create();

    em.destroy(b);

    expect(em.alive(a)).toBeTruthy();
    expect(em.alive(b)).toBeFalsy();
  });

  it('should return entity compositions', () => {
    expect(em.getComposition(em.create())).toBeInstanceOf(BitSet);
  });

  // Test for synchronizing entity groups.
  describe('sync()', () => {
    // Bits representing different kinds of components
    const compBitA = 1;
    const compBitB = 2;
    const compBitC = 4;
    const compBitD = 8;

    /** Helper to create an entity group. */
    function createGroup(inc: number, exc: number): EntityGroup {
      return new EntityGroup(new Filter(
        new BitSet(inc),
        new BitSet(exc)
      ));
    }

    /** Helper to create a dirty entity that has a `composition` automatically applied. */
    function createDirty(composition: number): Entity {
      const entity = em.create();

      em.getComposition(entity).add(composition);
      em.setDirty(entity);

      return entity;
    }

    it('should add eligible entities to groups', () => {
      const group = createGroup(compBitA | compBitB, compBitC);

      // Eligible entities that should be added to the group.
      const entity1 = createDirty(compBitA | compBitB);
      const entity2 = createDirty(compBitA | compBitB | compBitD);

      // Non-eligible entities to make sure that no entities are added to
      // the group that shouldn't.
      const entity3 = createDirty(compBitA);
      const entity4 = createDirty(compBitA | compBitB | compBitC);

      // Start the synchronization.
      em.sync([
        group
      ]);

      expect(group.has(entity1)).toBeTruthy();
      expect(group.has(entity2)).toBeTruthy();

      expect(group.has(entity3)).toBeFalsy();
      expect(group.has(entity4)).toBeFalsy();
    });

    it('should remove non-eligible entities from groups', () => {
      const group = createGroup(compBitA | compBitB, compBitC);

      const entity1 = createDirty(compBitA);
      const entity2 = createDirty(compBitA | compBitB | compBitC);

      group.add(entity1);
      group.add(entity2);

      em.sync([
        group
      ]);

      expect(group.has(entity1)).toBeFalsy();
      expect(group.has(entity2)).toBeFalsy();
    });
  });
});

