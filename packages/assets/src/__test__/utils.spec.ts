import { getDirectory, getExtension, normalize } from '../utils';


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
    [
      'test.json',
      'json'
    ],
    [
      'test.foobar.json',
      'foobar.json'
    ],
    [
      'foo/bar/test.json',
      'json'
    ],
    [
      'foo/bar/test.foobar.json',
      'foobar.json'
    ],
    [
      'foo/../bar/test.json',
      'json'
    ],
    [
      'foo/../bar/test.foobar.json',
      'foobar.json'
    ]
  ])('should return extension of %s', (file, extension) => {
    expect(getExtension(file)).toBe(extension);
  });
});

describe('normalize()', () => {
  it('should resolve ".." segments', () => {
    expect(normalize('foo/bar/../foobar')).toBe('foo/foobar');
  });
});
