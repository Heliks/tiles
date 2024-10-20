/** Path used to access a nested property on an object. */
export type ObjectPath = string[];

/** Parses the given `path` string and converts it into an `ObjectPath`. */
export function parseObjectPath(path: string): ObjectPath {
  return path.split('.');
}

/** Resolves the given object `path` from `context`. */
export function resolveObjectPath(context: object, path: ObjectPath): unknown {
  let value = context;

  for (const segment of path) {
    // Safety: Not sure if we can even properly type this. We skip validation entirely
    // because this function is performance critical.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value = (value as any)[segment];
  }

  return value;
}
