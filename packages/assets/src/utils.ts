/**
 * Returns the directory part of a file `path` similar to NodeJS `dirname`. The trailing
 * slash is removed automatically.
 */
export function getDirectory(path: string, ...append: string[]): string {
  const directory = path.slice(0, Math.max(0, Math.max(
    path.lastIndexOf('\\'),
    path.lastIndexOf('/')))
  );

  append.unshift(directory);

  return append.join('/');
}
