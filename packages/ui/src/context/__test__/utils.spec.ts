import { resolveObjectPath } from '../utils';


describe('resolveObjectPath', () => {
  it.each([
    {
      path: ['s0'],
      context: {
        s0: 'foobar'
      }
    },
    {
      path: ['s0', 's1'],
      context: {
        s0: {
          s1: 'foobar'
        }
      }
    },
    {
      path: ['s0', 's1', 's2'],
      context: {
        s0: {
          s1: {
            s2: 'foobar'
          }
        }
      }
    }
  ])('should resolve value from object path', test => {
    expect(resolveObjectPath(test.context, test.path)).toBe('foobar');
  });
});
