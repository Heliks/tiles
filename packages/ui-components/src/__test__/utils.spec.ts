import { kebabToCamel } from '../utils';


describe('kebabToCamel', () => {
  it.each([
    ['foo-bar', 'fooBar'],
    ['foo-bar-foo', 'fooBarFoo']
  ])('foo', (value, expected) => {
    expect(kebabToCamel(value)).toBe(expected);
  });
});
