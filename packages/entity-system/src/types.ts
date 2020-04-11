// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T = unknown> = new (...params: any[]) => T;
export type ComponentType<T = unknown> = ClassType<T>;

/** An entity is a unique symbol to which components can be attached to. */
export type Entity = number;

/** */
export interface Query {
  contains?: ClassType[];
  excludes?: ClassType[];
}

export interface Storage<T> {

  /**
   * Unique Id that is assigned to the storage when it is registered in the world.
   */
  readonly id: number;

  /**
   * Creates a new instance of the stored component `T`, assigns it to `entity` and
   * then returns it. If any `data` is given it will be assigned to the component
   * after its instantiation.
   */
  add(entity: Entity, data?: Partial<T>): T;

  /**
   * Directly assigns an `instance` of the stored component `T` to `entity`.
   */
  set(entity: Entity, instance: T): void;

  /**
   * Returns the stored component for `entity`. Throws an error if no component is
   * stored for it.
   */
  get(entity: Entity): T;

  /**
   * Returns `true` if a component is stored for `entity`.
   */
  has(entity: Entity): boolean;

  /**
   * Removes the stored component for `entity`. Returns `true` if a component was
   * removed and `false` otherwise.
   */
  remove(entity: Entity): boolean;

  /**
   * Drops all stored components.
   */
  drop(): void;

}

export interface World {

  /**
   * Registers a storage for the component `T`.
   */
  register<T>(component: ClassType<T>): Storage<T>;

  /**
   * Returns the storage for component `T`. If no storage for this component
   * exists it will be registered automatically.
   */
  storage<T>(component: ClassType<T>): Storage<T>;

}

