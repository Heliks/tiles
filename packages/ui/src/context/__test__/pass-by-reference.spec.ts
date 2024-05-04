import { ContextRef } from '../context-ref';
import { PassByReference } from '../pass-by-reference';


describe('PassByReference', () => {
  it('should assign input values to the local context', () => {
    const binding = new PassByReference('bar', 'foo');

    const parent = new ContextRef({ foo: 'bar' });
    const local = new ContextRef({ bar: 'foo' });

    // Set the local "bar" property to be an input.
    local.setInputs('bar');

    binding.resolve(local, parent);

    expect(local.context.bar).toBe('bar');
  });
});
