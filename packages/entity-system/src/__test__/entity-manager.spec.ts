import { EntityManager } from '../entity-manager';
import { ENTITY_BITS, ENTITY_MASK } from '../entity';

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
});

