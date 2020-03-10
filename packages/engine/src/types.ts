/** A constructor type that produces instances of type `T` */
export type ClassType<T = any> = new (...params: any[]) => T;

/** Basic data structure. */
export interface Struct<T = unknown> {
  [key: string]: T;
}

export type Vec2 = [number, number];
