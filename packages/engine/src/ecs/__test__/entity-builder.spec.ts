import { Storage, World } from '@heliks/ecs';
import { Parent } from '@heliks/ecs-hierarchy';
import { EntityBuilder } from '../entity-builder';


describe('EntityBuilder', () => {
  let builder: EntityBuilder;
  let parents: Storage<Parent>;

  let world: World;

  beforeEach(() => {
    world = new World();

    parents = world.storage(Parent);
    builder = new EntityBuilder(world, world.insert());
  });

  it('should create child entities', () => {
    const root = builder
      .child(builder => builder.child())
      .build();

    // We should now have a total of 3 entities:
    // - Root
    //  - ChildA
    //    - ChildB
    const childA = world.entities.get(1);
    const childB = world.entities.get(2);

    const parentA = parents.get(childA);
    const parentB = parents.get(childB);

    expect(parentA.entity).toBe(root);
    expect(parentB.entity).toBe(childA);
  });
});
