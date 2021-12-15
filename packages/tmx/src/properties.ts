export interface TmxPropertyData {
  name: string;
  value: string | number;
  type: 'bool' | 'float' | 'int' | 'string';
}

/**
 * An object that contains custom `TmxPropertyData`.
 * @see TmxPropertyData
 */
export interface HasPropertiesFormat {
  properties?: TmxPropertyData[];
}

/** Custom properties. */
export interface Properties {
  [property: string]: unknown;
}

/**
 * An object that carries custom
 *
 * Helper type that indicates a structure carries parsed TMX properties. */
export interface HasProperties<T = Properties> {

  /** Custom properties. */
  readonly properties: T;

}

/**
 * Extracts the custom properties from any TMX formatted data. This is always a
 * `Partial` of the original type `T`, as we currently can not guarantee that all the
 * required properties really exist.
 */
export function getProperties<T extends Properties>(target: HasPropertiesFormat): Partial<T> {
  const data: Properties = {};

  if (target.properties) {
    for (const item of target.properties) {
      data[item.name] = item.value;
    }
  }

  return data as T;
}
