export enum CustomPropertyType {
  String = 'string',
  Boolean = 'boolean'
}

export interface CustomPropertyData {
  name: string;
  type: CustomPropertyType;
  value: unknown;
}

export type CustomPropertiesData = CustomPropertyData[];
export type CustomProperties = object;

export interface HasCustomPropertiesData {
  props?: CustomPropertiesData;
}

export function parseCustomProperties<T extends CustomProperties = CustomProperties>(data: CustomPropertiesData): T {
  const properties: { [key: string]: unknown } = {};

  for (const item of data) {
    properties[item.name] = item.value;
  }

  return properties as T;
}

export function extractCustomProperties<T extends CustomProperties = CustomProperties>(target: HasCustomPropertiesData): T {
  return target.props ? parseCustomProperties(target.props) : {} as T;
}
