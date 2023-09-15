import { Injectable } from '@heliks/tiles-injector';
import { Entity, EntityBuilder, World } from '../ecs';
import { isIgnored, TypeRegistry } from '../types';
import { ComponentList } from './component-list';
import { SerializationQuery } from './serialization-query';
import { EntityData, EntitySerializer as BaseEntitySerializer } from './types';


/** @inheritDoc */
@Injectable()
export class EntitySerializer implements BaseEntitySerializer {

  /**
   * @param types {@see TypeRegistry}
   */
  constructor(public readonly types: TypeRegistry) {}

  /** @inheritDoc */
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

  /** @inheritDoc */
  public deserialize(world: World, data: EntityData): EntityBuilder {
    const builder = world.create();

    for (const namespace in data) {
      const { strategy } = this.types.entry(namespace);

      builder.use(
        strategy.deserialize(data[namespace], world)
      );
    }

    return builder;
  }

  /**
   * Deserializes the given entity `data` and extracts all components found in that data
   * set. Unlike {@link deserialize}, this does not create an {@link Entity entity} in
   * the process.
   */
  public extract(world: World, data: EntityData): ComponentList {
    const components = new ComponentList();

    for (const namespace in data) {
      const { strategy } = this.types.entry(namespace);

      components.add(
        strategy.deserialize(data[namespace], world) as object
      );
    }

    return components;
  }

  /** Returns a {@link SerializationQuery}. */
  public query(world: World): SerializationQuery {
    return new SerializationQuery(world, this);
  }

}
