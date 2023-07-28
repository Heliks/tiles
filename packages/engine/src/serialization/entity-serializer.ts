import { Injectable } from '@heliks/tiles-injector';
import { Entity, EntityBuilder, World } from '../ecs';
import { isIgnored, TypeRegistry } from '../types';
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
    const builder = world.builder();

    for (const namespace in data) {
      const { strategy } = this.types.entry(namespace);

      builder.use(
        strategy.deserialize(data[namespace], world)
      );
    }

    return builder;
  }

  /** Returns a {@link SerializationQuery}. */
  public query(world: World): SerializationQuery {
    return new SerializationQuery(world, this);
  }

}
