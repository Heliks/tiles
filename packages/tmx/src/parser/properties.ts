import { Struct } from '@heliks/tiles-engine';

export interface TmxPropertyData {
  name: string;
  value: string | number;
  type: 'bool' | 'float' | 'int' | 'string';
}

export interface HasTmxPropertyData {
  properties?: TmxPropertyData[];
}

/** Extracts the custom properties from any TMX formatted data. */
export function tmxParseProperties<T>(target: HasTmxPropertyData): Partial<T> {
  const data: Struct = {};

  if (target.properties) {
    for (const item of target.properties) {
      data[ item.name ] = item.value;
    }
  }

  return data as Partial<T>;
}
