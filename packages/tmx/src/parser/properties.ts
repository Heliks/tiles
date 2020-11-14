export interface TmxPropertyData {
  name: string;
  value: string | number;
  type: 'bool' | 'float' | 'int' | 'string';
}

/** An object that contains `TmxPropertyData`. */
export interface HasTmxPropertyData {
  properties?: TmxPropertyData[];
}

/** Custom properties. */
export interface TmxProperties {
  [property: string]: unknown;
}

/** Extracts the custom properties from any TMX formatted data. */
export function tmxParseProperties(target: HasTmxPropertyData): TmxProperties {
  const data: TmxProperties = {};

  if (target.properties) {
    for (const item of target.properties) {
      data[item.name] = item.value;
    }
  }

  return data;
}
