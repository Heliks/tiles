import { Parent, runtime, World } from '@heliks/tiles-engine';
import { Host } from '../host';


describe('Host', () => {
  let world: World;

  beforeEach(() => {
    world = runtime().build().world;
  });

  it('should resolve host for entity', () => {
    const entity1 = world.insert(new Host());
    const entity2 = world.insert(new Parent(entity1));
    const entity3 = world.insert(new Parent(entity2));

    const host1 = Host.get(world, entity2);
    const host2 = Host.get(world, entity3);

    expect(host1).toBe(entity1);
    expect(host2).toBe(entity1);
  });
});
