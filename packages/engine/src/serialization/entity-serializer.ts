import { Struct } from '../utils/types';
import { Entity, EntityBuilder, World } from '../ecs';
import { isIgnored } from '../types/ignore';
import { Injectable } from '@heliks/tiles-injector';
import { TypeRegistry } from '../types';


/**
 * Serialized entity data that is stringify-able via `JSON.stringify()`. Each key in
 * this object is the namespace of a component.
 */
export type EntityData = Struct;

/**
 * Serializes entities.
 */
@Injectable()
export class EntitySerializer {

  /**
   * @param types {@see TypeRegistry}
   */
  constructor(public readonly types: TypeRegistry) {}

  /** Serializes the given `entity` and all of its components. */
  public serialize(world: World, entity: Entity): EntityData {
    const data: EntityData = {};

    for (const storage of world.getStorages()) {
      if (isIgnored(storage.type) || ! storage.has(entity)) {
        continue;
      }

      const item = this.types.entry(storage.type);

      if (item) {
        data[ item.id ] = item.strategy.serialize(storage.get(entity), world);
      }
    }

    return data;
  }

  /** De-serializes `data` into an `EntityBuilder`. */
  public deserialize(world: World, data: EntityData): EntityBuilder {
    const builder = world.builder();

    for (const namespace in data) {
      const { strategy } = this.types.entry(namespace);

      builder.use(
        strategy.deserialize(data[namespace], world)
      );
    }

    return builder;
  }

}
