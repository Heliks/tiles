import { getDirectory, getExtension } from '../utils';


describe('getDirectory()', () => {
  it.each([
    [
      'a/b/../c/foo.json',
      'a/b/../c'
    ],
    [
      'a/b/c.json',
      'a/b'
    ],
    [
      'a\\b\\c.json',
      'a\\b'
    ],
  ])('should get directory from path %s', (path, dir) => {
    expect(getDirectory(path)).toBe(dir);
  });

  it('should add additional segments to the extracted path', () => {
    expect(getDirectory('a/b/c.json', 'c', 'd')).toBe('a/b/c/d');
  });
});

describe('getExtension()', () => {
  it.each([
    ['a/b/test.json', 'json'],
    ['a/b/test.foobar.json', 'foobar.json']
  ])('should return extension of %s', (file, extension) => {
    expect(getExtension(file)).toBe(extension);
  });
});
