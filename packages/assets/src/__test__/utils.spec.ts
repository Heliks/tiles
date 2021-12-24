import { getDirectory } from "../utils";

describe('getDirectory()', () => {
  it('should return the directory from a unix path', () => {
    expect(getDirectory('a/b/c.json')).toBe('a/b');
  });

  it('should return the directory from a windows path', () => {
    expect(getDirectory('a\\b\\c.json')).toBe('a\\b');
  });

  it('should add additional segments to the extracted path', () => {
    expect(getDirectory('a/b/c.json', 'c', 'd')).toBe('a/b/c/d');
  });
});
