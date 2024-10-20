import { Input } from '../../input';
import { ContextRef } from '../context-ref';


describe('ContextRef', () => {
  describe('when setting an input', () => {
    it('should update property on context', () => {
      const context = {
        foo: false
      };

      ContextRef.from(context).setInput('foo', 'bar');

      expect(context.foo).toBe('bar');
    });

    it('should not update property on context if new value is equal to the current one', () => {
      const value = 'foobar';

      class TrackValueUpdateContext {

        // We keep track of how often the "foo" input on this context was set. For this
        // test to pass, it should remain at 0.
        public updates = 0;

        @Input()
        public set foo(value: unknown) {
          this.updates++;
        }

        // Mock the current input value to be the same as the one we're trying to set.
        public get foo() {
          return value;
        }

      }

      const context = new TrackValueUpdateContext();

      ContextRef.from(context).setInput('foo', value);

      expect(context.updates).toBe(0);
    });

    it('should track change', () => {
      const context = {
        foo: 'foo'
      };

      const ref = ContextRef.from(context);

      ref.track = true;
      ref.setInput('foo', 'bar');

      expect(ref.changes).toMatchObject({
        foo: {
          previous: 'foo',
          current: 'bar'
        }
      });
    });
  });
});
