/**
 * Returns the directory in the given `path`, similar to NodeJS `__dirname()` without
 * a trailing slash. Additional directory segments can be added via `append`.
 */
export function getDirectory(path: string, ...append: string[]): string {
  const directory = path.slice(0, Math.max(0, Math.max(
    path.lastIndexOf('\\'),
    path.lastIndexOf('/')))
  );

  append.unshift(directory);

  return append.join('/');
}
