import { World } from '../world';

describe('Archetype', () => {
  let world: World;

  class A {
    test?: string;
  }

  class B {
    test?: string;
  }

  beforeEach(() => {
    world = new World();
  });

  it('should build an entity', () => {
    const archetype = world.archetype()
      .add(A, {test: 'foo'})
      .add(B, {test: 'bar'});

    const entity = archetype.build();

    expect(world.storage(A).get(entity).test).toBe('foo');
    expect(world.storage(B).get(entity).test).toBe('bar');
  });

  it('should build many unique entities from the same archetype', () => {
    const archetype = world.archetype().add(A, {
      test: 'foobar'
    });

    const entity1 = archetype.build();
    const entity2 = archetype.build();

    // Make sure each entity is unique.
    expect(entity1).not.toBe(entity2);

    expect(world.storage(A).get(entity1).test).toBe('foobar');
    expect(world.storage(A).get(entity2).test).toBe('foobar');
  });

  it('should be converted to an entity builder', () => {
    const builder = world.archetype().add(A, {test: 'foo'}).toBuilder();
    const entity = builder.add(B, {test: 'bar'}).build();

    // Entity should have both the component added via archetype and the one
    // added by the builder.
    expect(world.storage(A).get(entity).test).toBe('foo');
    expect(world.storage(B).get(entity).test).toBe('bar');
  });
});
