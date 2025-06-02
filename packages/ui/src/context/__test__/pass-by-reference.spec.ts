import { ContextRef } from '../context-ref';
import { PassByReference } from '../pass-by-reference';


describe('PassByReference', () => {
  it('should assign input values to the local context', () => {
    const host = ContextRef.from({
      foo: 'bar'
    });

    const local = ContextRef.from({
      bar: 'foo'
    });

    // Set the local "bar" property to be an input.
    local.setInputs('bar');

    new PassByReference('bar', ['foo']).resolve(local, host);

    expect(local.context.bar).toBe('bar');
  });

  it('should assign input values to the local context', () => {
    const local = ContextRef.from({
      local0: false
    });

    const host = ContextRef.from({
      host0: {
        host1: 'foobar'
      }
    });

    // Set the local "bar" property to be an input.
    local.setInputs('p0');

    new PassByReference('local0', ['host0', 'host1']).resolve(local, host);

    expect(local.context.local0).toBe('foobar');
  });
});
