import { parseBit, parseBitSet } from '../bitset';


describe('parseBit', () => {
  it.each([
    {
      bit: 0,
      key: "foo 0"
    },
    {
      bit: 3,
      key: "foo 3"
    }
  ])('should return bit $bit from key $key', data => {
    expect(parseBit(data.key)).toBe(data.bit);
  });

  it.each([
    'foo',
    'foo bar',
    'foo bar 0',
    '0',
    '0 foo'
  ])('should throw when a wrong format is given', key => {
    expect(() => parseBit(key)).toThrow();
  });
});

describe('parseBitSet', () => {
  it('should return a bit mask containing all enabled bits', () => {
    const mask = parseBitSet({
      'foo 1': false,
      'foo 2': true,
      'foo 4': true
    });

    // Check against bits that should be toggled on (2 & 4).
    expect(mask & (2 | 4)).toBeTruthy();
  });
});
