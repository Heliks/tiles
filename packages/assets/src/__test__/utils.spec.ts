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
    ]
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
  it.each([
    {
      path: 'foo/bar/../foobar',
      result: 'foo/foobar'
    },
    {
      path: 'dir0/dir1/dir2/../dir3/../../dir4',
      result: 'dir0/dir4'
    },
    {
      path: 'C:/dir0/../dir1/dir2',
      result: 'C:/dir1/dir2'
    }
  ])('should resolve ".." segments in $path', data => {
    expect(normalize(data.path)).toBe(data.result);
  });

  it('should normalize paths with leading "/"', () => {
    expect(normalize('/foo/bar')).toBe('/foo/bar');
  });

  it('should normalize paths with trailing "/"', () => {
    expect(normalize('foo/bar/')).toBe('foo/bar');
  });

  it('should ignore empty segments', () => {
    expect(normalize('foo///bar')).toBe('foo/bar');
  });

  it('should ignore "." segments', () => {
    expect(normalize('foo/./bar')).toBe('foo/bar');
  });

  it('should handle empty string input', () => {
    expect(normalize('')).toBe('');
  });
});
