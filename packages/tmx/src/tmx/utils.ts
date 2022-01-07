export interface TmxPropertyData {
  name: string;
  value: string | number;
  type: 'bool' | 'float' | 'int' | 'string';
}

/**
 * An object that contains custom `TmxPropertyData`.
 * @see TmxPropertyData
 */
export interface TmxHasProperties {
  properties?: TmxPropertyData[];
}
