import { Context } from '../context';


describe('Context', () => {
  let context: Context<{ bar: string }, { foo: string }>;

  beforeEach(() => {
    context = new Context<{ bar: string }, { foo: string }>();

    // Map local "bar" key to "foo".
    context.bind('bar', 'foo');
  });

  it('should apply inputs to local view reference', () => {
    // Set local "bar" property as input.
    context.input('bar');

    const local = { bar: 'foo' };
    const parent = { foo: 'bar' };

    context.apply(local, parent);

    expect(local.bar).toBe('bar');
  });

  it('should apply outputs to parent view reference', () => {
    // Set local "bar" property as output
    context.output('bar');

    const local = { bar: 'foo' };
    const parent = { foo: 'bar' };

    context.apply(local, parent);

    expect(parent.foo).toBe('foo');
  });
});