/**
 * Returns the directory in the given `file`, similar to NodeJS `__dirname()` without
 * a trailing slash. Additional directory segments can be added via `append`.
 */
export function getDirectory(file: string, ...append: string[]): string {
  const directory = file.slice(0, Math.max(0, Math.max(
    file.lastIndexOf('\\'),
    file.lastIndexOf('/')))
  );

  append.unshift(directory);

  return append.join('/');
}

/**
 * Returns the extension of a `file` path without the preceding dot. Returns `undefined`
 * if no extension can be found.
 *
 * If the file has more than one extension, both are considered. For example, using the
 * file path `'foo.test.json'`, the result would be `'test.json'`, not just `'json'`.
 */
export function getExtension(file: string): string | undefined {
  const idx = file.indexOf('.', file.lastIndexOf('/'));

  if (idx > -1) {
    return file.slice(idx + 1);
  }
}

/** Joins all `segments` together to a path. */
export function join(...segments: string[]): string {
  return segments.join('/');
}

/** Normalizes a `path`. */
export function normalize(path: string): string {
  const absolute = path.startsWith('/');
  const segments = [];

  for (const segment of path.split('/')) {
    switch (segment) {
      case '..':
        if (segments.length > 0) {
          segments.pop();
        }
        break;
      // Skip empty segments.
      case '':
      case '.':
        continue;
      default:
        segments.push(segment);
    }
  }

  return `${absolute ? '/' : ''}${segments.join('/')}`;
}
