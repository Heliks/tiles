import { EntityBuilder } from '../entity-builder';
import { World } from '../world';

describe('EntityBuilder', () => {
  it('should build entities', () => {
    const world = new World();
    const builder = world.archetype().toBuilder();

    class A {
    }

    class B {
    }

    builder.add(A);
    builder.add(B);

    const entity = builder.build();

    expect(world.storage(A).has(entity)).toBeTruthy();
    expect(world.storage(B).has(entity)).toBeTruthy();
  });
});
