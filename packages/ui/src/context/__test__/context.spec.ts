import { Parent, runtime, World } from '@heliks/tiles-engine';
import { Host } from '../context';


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

/*
describe('Context', () => {
  let context: ContextRef;

  beforeEach(() => {
    context = new Context<{ bar: string }, { foo: string }>();

    // Map local "bar" key to "foo".
    context.bind('bar', 'foo');
  });

  it('should apply inputs to local view reference', () => {
    const parent = new ContextRef({ foo: 'bar' });
    const local = new ContextRef({ bar: 'foo' });

    // Set the local "bar" property to be an input.
    local.setInputs('bar');

    context.apply(local, parent);

    expect(local.context.bar).toBe('bar');
  });

  it('should apply outputs to parent view reference', () => {
    const parent = new ContextRef({ foo: 'bar' });
    const local = new ContextRef({ bar: 'foo' });

    // Set local "bar" property to be an output.
    local.setOutputs('bar');
    
    context.apply(local, parent);

    expect(parent.context.foo).toBe('foo');
  });
});

 */