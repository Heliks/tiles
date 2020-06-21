/**
 * Returns the directory contained in a file `path`. E.g. the path
 * `'../example/file.json'` will return `'../example'`. The trailing
 * slash is always removed.
 */
export function getDirectory(path: string): string {
  // Respect both windows (\) and unix (/) path separators.
  return path.slice(0, Math.max(0, Math.max(
    path.lastIndexOf('\\'),
    path.lastIndexOf('/')
  )));
}
