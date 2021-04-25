import { EntityBuilder } from '@heliks/tiles-engine';
import { Properties } from '@heliks/tiles-tmx';

/** Hooks for object spawn events. */
export interface ObjectType<T = unknown> {

  /** Called when the entity for this object type is being built by the map spawner. */
  onSpawn(entity: EntityBuilder, properties: T): void;

}

export class ObjectTypes {

  /** @internal */
  private readonly types = new Map<string, ObjectType>();

  /** Registers an object `type`. Throws an error if `type` already exists. */
  public set(type: string, klass: ObjectType): this {
    if (this.types.has(type)) {
      throw new Error(`Type ${type} already exists`);
    }

    this.types.set(type, klass);

    return this;
  }

  /** Returns the object type `type` if it exists. */
  public get(type: string): ObjectType | undefined {
    return this.types.get(type);
  }

}
