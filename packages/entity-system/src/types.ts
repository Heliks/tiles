import { EventQueue } from "@heliks/event-queue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T = unknown> = new (...params: any[]) => T;
export type ComponentType<T = unknown> = ClassType<T>;

/**
 * An entity identifier to which components can be attached.
 *
 * The 32 bit identifier is split into two parts, one being the index that
 * the entity occupies in memory, and the second is the version, or the
 * "generation" in which the entity exists.
 *
 * For simplicities sake lets pretend the entity is an 8 bit identifier
 * instead, where the last two bits are reserved for the version:
 *
 * Entity = 00100100
 *          001001[00] <-- steal two bits for version
 *
 * Which leaves us with an index part 001001 (9) for the entity index,
 * and 00 (0) for the entity version.
 */
export type Entity = number;

/** */
export interface Query {
  contains?: ClassType[];
  excludes?: ClassType[];
}

/** Possible component event types. */
export enum ComponentEventType {
  /** Occurs when a component is added to an entity. */
  Added,
  /** Occurs when a component is removed from an entity. */
  Removed
}

export interface ComponentEvent {
  /** The entity that triggered the event. */
  entity: Entity,
  /** The event type. */
  type: ComponentEventType;
}

export interface Storage<T> {

  /** Unique Id that is assigned to the storage when it is registered in the world. */
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

  /**
   * Returns the event queue to which this storage will push events. You can subscribe
   * to this to be notified about component changes.
   */
  events(): EventQueue<ComponentEvent>;

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

