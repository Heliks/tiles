import { Context } from '../context';


describe('Context', () => {
  it('should resolve context data', () => {
    const context = new Context<{ bar: string }, { foo: string }>();

    // Map local "bar" key to "foo".
    context.bind('bar', 'foo');

    // Resolve data from object.
    context.resolve({
      foo: 'foobar'
    });

    expect(context.data.bar).toBe('foobar');
  });

  it('should apply input data', () => {
    const context = new Context<{ foo: boolean, bar: boolean }>();
    const target = {
      foo: false,
      bar: false
    };

    context.data.foo = true;
    context.data.bar = true;

    context.input('foo');
    context.apply(target);

    expect(target).toMatchObject({
      foo: true,
      bar: false
    });
  });
});